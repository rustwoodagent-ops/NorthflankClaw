"""
Acoustic Analysis Service
Implements the full VOXAI acoustic feature extraction pipeline:
  - Audio normalisation (pydub + librosa)
  - Pitch tracking via pYIN
  - Jitter + shimmer perturbation measures
  - RMS energy + dynamic range
  - Zero crossing rate
  - Spectral features (centroid, flatness, rolloff)
  - HPSS + Harmonic-to-Percussive Ratio
  - MFCCs (13 coefficients)
  - Diagnostic flags + normative comparisons
  - Mel spectrogram PNG generation
"""

import os
import io
import json
import math
import logging
import tempfile
from pathlib import Path
from typing import Optional

import numpy as np
import scipy.signal
import librosa
import librosa.display
import soundfile as sf
import httpx
import boto3
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt

logger = logging.getLogger(__name__)

S3_BUCKET = os.environ["S3_BUCKET"]
s3_client = boto3.client(
    "s3",
    region_name=os.environ.get("AWS_REGION", "us-east-1"),
    aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
)

# ─── Constants ────────────────────────────────────────────────────────────────
SR = 22050
N_FFT = 2048
HOP_LENGTH = 512
N_MFCC = 13


# ─── Audio loading ────────────────────────────────────────────────────────────

def load_audio(audio_url: str) -> tuple[np.ndarray, float]:
    """Download and normalise audio to mono float32 @ 22050 Hz."""
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        tmp_path = f.name

    try:
        logger.info("Downloading audio for acoustic analysis...")
        with httpx.Client(timeout=300) as client:
            response = client.get(audio_url)
            response.raise_for_status()
            Path(tmp_path).write_bytes(response.content)

        y, sr = librosa.load(tmp_path, sr=SR, mono=True, dtype=np.float32)
        duration = len(y) / SR
        logger.info(f"Loaded audio: {duration:.2f}s, {len(y)} samples @ {SR}Hz")
        return y, duration
    finally:
        os.unlink(tmp_path)


# ─── Feature extraction ───────────────────────────────────────────────────────

def extract_pitch(y: np.ndarray) -> dict:
    """pYIN pitch tracking — returns per-frame F0 array and derived stats."""
    logger.info("Running pYIN pitch tracking...")

    f0, voiced_flag, voiced_prob = librosa.pyin(
        y,
        fmin=librosa.note_to_hz("C2"),   # ~65 Hz
        fmax=librosa.note_to_hz("C7"),   # ~2093 Hz
        sr=SR,
        frame_length=N_FFT,
        hop_length=HOP_LENGTH,
    )

    voiced_f0 = f0[voiced_flag & ~np.isnan(f0)]

    if len(voiced_f0) == 0:
        return {
            "f0_frames": f0.tolist(),
            "mean_f0": 0.0,
            "f0_std": 0.0,
            "f0_range": 0.0,
            "voiced_fraction": 0.0,
        }

    return {
        "f0_frames": [float(v) if not np.isnan(v) else None for v in f0],
        "mean_f0": float(np.mean(voiced_f0)),
        "f0_std": float(np.std(voiced_f0)),
        "f0_range": float(np.max(voiced_f0) - np.min(voiced_f0)),
        "voiced_fraction": float(np.sum(voiced_flag) / len(voiced_flag)),
    }


def extract_jitter(f0: np.ndarray, voiced_flag: np.ndarray) -> float:
    """
    Local jitter (relative average perturbation):
    mean(|T_i - T_{i-1}|) / mean(T_i) × 100
    """
    voiced_f0 = f0[voiced_flag & ~np.isnan(f0)]
    if len(voiced_f0) < 2:
        return 0.0

    periods = 1.0 / voiced_f0
    abs_diffs = np.abs(np.diff(periods))
    jitter = (np.mean(abs_diffs) / np.mean(periods)) * 100.0
    return float(jitter)


def extract_shimmer(y: np.ndarray, voiced_flag: np.ndarray) -> float:
    """
    Local shimmer:
    mean(|A_i - A_{i-1}|) / mean(A_i) × 100
    using RMS per voiced frame.
    """
    rms = librosa.feature.rms(y=y, frame_length=N_FFT, hop_length=HOP_LENGTH)[0]

    # Align voiced_flag length to rms length
    min_len = min(len(rms), len(voiced_flag))
    rms = rms[:min_len]
    voiced = voiced_flag[:min_len]

    voiced_rms = rms[voiced]
    if len(voiced_rms) < 2:
        return 0.0

    abs_diffs = np.abs(np.diff(voiced_rms))
    shimmer = (np.mean(abs_diffs) / (np.mean(voiced_rms) + 1e-10)) * 100.0
    return float(shimmer)


def extract_energy(y: np.ndarray) -> dict:
    """RMS energy, standard deviation, dynamic range."""
    rms = librosa.feature.rms(y=y, frame_length=N_FFT, hop_length=HOP_LENGTH)[0]
    mean_rms = float(np.mean(rms))
    rms_std = float(np.std(rms))

    rms_nonzero = rms[rms > 1e-10]
    if len(rms_nonzero) < 2:
        dynamic_range_db = 0.0
    else:
        dynamic_range_db = float(
            20 * np.log10(np.max(rms_nonzero) / np.min(rms_nonzero) + 1e-10)
        )

    return {
        "mean_rms": mean_rms,
        "rms_std": rms_std,
        "dynamic_range_db": dynamic_range_db,
    }


def extract_zcr(y: np.ndarray) -> float:
    """Mean zero crossing rate."""
    zcr = librosa.feature.zero_crossing_rate(y, frame_length=N_FFT, hop_length=HOP_LENGTH)[0]
    return float(np.mean(zcr))


def extract_spectral_features(y: np.ndarray) -> dict:
    """Spectral centroid, flatness, rolloff."""
    centroid = librosa.feature.spectral_centroid(y=y, sr=SR, n_fft=N_FFT, hop_length=HOP_LENGTH)[0]
    flatness = librosa.feature.spectral_flatness(y=y, n_fft=N_FFT, hop_length=HOP_LENGTH)[0]
    rolloff = librosa.feature.spectral_rolloff(
        y=y, sr=SR, n_fft=N_FFT, hop_length=HOP_LENGTH, roll_percent=0.85
    )[0]

    # Convert flatness to dB
    flatness_db = 10 * np.log10(np.mean(flatness) + 1e-10)

    return {
        "spectral_centroid": float(np.mean(centroid)),
        "spectral_flatness": float(flatness_db),
        "spectral_rolloff": float(np.mean(rolloff)),
    }


def extract_hpss(y: np.ndarray) -> dict:
    """
    Harmonic-Percussive Source Separation.
    Returns HPR (Harmonic-to-Percussive Ratio) in dB.
    """
    S = np.abs(librosa.stft(y, n_fft=N_FFT, hop_length=HOP_LENGTH))
    H, P = librosa.decompose.hpss(S, power=2.0)

    harmonic_energy = np.sum(np.abs(H) ** 2)
    percussive_energy = np.sum(np.abs(P) ** 2)

    hpr = harmonic_energy / (percussive_energy + 1e-10)
    hpr_db = float(10 * np.log10(hpr + 1e-10))

    return {"hpr_db": hpr_db}


def extract_mfcc(y: np.ndarray) -> dict:
    """13 MFCCs — mean and std dev per coefficient."""
    mfcc = librosa.feature.mfcc(
        y=y, sr=SR, n_mfcc=N_MFCC, n_fft=N_FFT, hop_length=HOP_LENGTH
    )
    return {
        "mfcc_means": [round(float(v), 3) for v in np.mean(mfcc, axis=1)],
        "mfcc_stds": [round(float(v), 3) for v in np.std(mfcc, axis=1)],
    }


# ─── Diagnostic flags ─────────────────────────────────────────────────────────

def compute_diagnostic_flags(features: dict) -> dict:
    """Apply VOXAI normative thresholds and produce diagnostic flag set."""
    return {
        "jitter_elevated": features["jitter_pct"] > 1.04,
        "shimmer_elevated": features["shimmer_pct"] > 3.81,
        "low_dynamic_range": features["dynamic_range_db"] < 6.0,
        "high_spectral_flatness": features["spectral_flatness"] > -20.0,
        "low_voiced_fraction": features["voiced_fraction"] < 0.5,
        "high_zcr": features["mean_zcr"] > 0.15,
    }


def compute_normative_comparisons(features: dict) -> list:
    """Produce [MEASURED]-tagged normative comparisons for each key feature."""
    comparisons = []

    def compare(feature, value, unit, norm_desc, within_norm, tag="MEASURED"):
        comparisons.append({
            "feature": feature,
            "value": round(value, 3),
            "unit": unit,
            "norm": norm_desc,
            "withinNorm": within_norm,
            "evidenceTag": tag,
        })

    compare("Jitter (local)", features["jitter_pct"], "%",
            "< 1.04% (Praat clinical threshold)",
            features["jitter_pct"] < 1.04)

    compare("Shimmer (local)", features["shimmer_pct"], "%",
            "< 3.81% (Praat clinical threshold)",
            features["shimmer_pct"] < 3.81)

    compare("HPR", features["hpr_db"], "dB",
            "> 0 dB (tonal dominant)",
            features["hpr_db"] > 0)

    compare("Dynamic Range", features["dynamic_range_db"], "dB",
            "10–25 dB (typical expressive range)",
            6 <= features["dynamic_range_db"] <= 30)

    compare("Voiced Fraction", features["voiced_fraction"] * 100, "%",
            "> 60% for sustained phonation",
            features["voiced_fraction"] > 0.6)

    mean_f0 = features["mean_f0"]
    is_higher_voice = mean_f0 > 200
    if is_higher_voice:
        in_range = 165 <= mean_f0 <= 255
        compare("Mean F0", mean_f0, "Hz", "165–255 Hz (female speech)", in_range)
    else:
        in_range = 85 <= mean_f0 <= 180
        compare("Mean F0", mean_f0, "Hz", "85–180 Hz (male speech)", in_range)

    compare("Spectral Flatness", features["spectral_flatness"], "dB",
            "< -20 dB (tonal signal preferred)",
            features["spectral_flatness"] < -20,
            "INFERRED")

    return comparisons


# ─── Spectrogram generation ───────────────────────────────────────────────────

def generate_spectrogram(
    y: np.ndarray,
    f0_frames: list,
    recording_id: str,
    user_id: str,
) -> Optional[str]:
    """Generate a mel spectrogram PNG and upload to S3."""
    try:
        fig, ax = plt.subplots(figsize=(14, 4), facecolor="#0e1117")
        ax.set_facecolor("#0e1117")

        mel_spec = librosa.feature.melspectrogram(
            y=y, sr=SR, n_fft=N_FFT, hop_length=HOP_LENGTH, n_mels=128
        )
        mel_db = librosa.power_to_db(mel_spec, ref=np.max)

        img = librosa.display.specshow(
            mel_db,
            sr=SR,
            hop_length=HOP_LENGTH,
            x_axis="time",
            y_axis="mel",
            ax=ax,
            cmap="magma",
        )

        # Overlay F0 curve
        times = librosa.frames_to_time(
            np.arange(len(f0_frames)), sr=SR, hop_length=HOP_LENGTH
        )
        f0_array = np.array([v if v is not None else np.nan for v in f0_frames])
        ax.plot(times, f0_array, color="#00e5ff", linewidth=1.5, alpha=0.8, label="F0")

        ax.set_xlabel("Time (s)", color="#64748b")
        ax.set_ylabel("Frequency (Hz)", color="#64748b")
        ax.tick_params(colors="#64748b")
        for spine in ax.spines.values():
            spine.set_edgecolor("#1e2535")

        plt.tight_layout()

        buf = io.BytesIO()
        plt.savefig(buf, format="png", dpi=120, bbox_inches="tight",
                    facecolor="#0e1117", edgecolor="none")
        buf.seek(0)
        plt.close(fig)

        s3_key = f"recordings/{user_id}/{recording_id}/spectrogram.png"
        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=s3_key,
            Body=buf.getvalue(),
            ContentType="image/png",
        )
        logger.info(f"Spectrogram uploaded to s3://{S3_BUCKET}/{s3_key}")
        return s3_key

    except Exception as e:
        logger.warning(f"Spectrogram generation failed: {e}")
        return None


# ─── Main entry point ─────────────────────────────────────────────────────────

def analyse_audio(
    audio_url: str,
    recording_id: str,
    user_id: str,
) -> dict:
    """
    Full VOXAI acoustic analysis pipeline.
    Returns complete feature set + frame-by-frame F0 + spectrogram S3 key.
    """
    y, duration = load_audio(audio_url)

    # Minimum duration check
    if duration < 0.5:
        raise ValueError(f"Recording too short ({duration:.2f}s). Minimum 0.5s required.")

    logger.info(f"Extracting acoustic features for {recording_id} ({duration:.1f}s)...")

    # Extract all features
    pitch_data = extract_pitch(y)
    f0_array = np.array([v if v is not None else np.nan for v in pitch_data["f0_frames"]])
    voiced_flag = ~np.isnan(f0_array)

    energy_data = extract_energy(y)

    features = {
        # Pitch
        "mean_f0": round(pitch_data["mean_f0"], 2),
        "f0_std": round(pitch_data["f0_std"], 2),
        "f0_range": round(pitch_data["f0_range"], 2),
        "voiced_fraction": round(pitch_data["voiced_fraction"], 4),
        # Perturbation
        "jitter_pct": round(extract_jitter(f0_array, voiced_flag), 4),
        "shimmer_pct": round(extract_shimmer(y, voiced_flag), 4),
        # Energy
        "mean_rms": round(energy_data["mean_rms"], 6),
        "rms_std": round(energy_data["rms_std"], 6),
        "dynamic_range_db": round(energy_data["dynamic_range_db"], 2),
        # Spectral
        "mean_zcr": round(extract_zcr(y), 6),
        **extract_spectral_features(y),
        # Harmonic
        **extract_hpss(y),
        # Timbre
        **extract_mfcc(y),
    }

    # Diagnostic flags and normative comparisons
    features["diagnostic_flags"] = compute_diagnostic_flags(features)
    features["normative_comparisons"] = compute_normative_comparisons(features)

    # Generate spectrogram
    spectrogram_key = generate_spectrogram(
        y, pitch_data["f0_frames"], recording_id, user_id
    )

    logger.info(f"Feature extraction complete for {recording_id}")

    return {
        "features": features,
        "f0_frames": pitch_data["f0_frames"],
        "spectrogram_s3_key": spectrogram_key,
        "duration_sec": round(duration, 3),
    }
