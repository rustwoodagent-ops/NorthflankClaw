"""
Source Separation Service
Uses Facebook's Demucs (htdemucs_ft) to split a recording into:
  - vocals
  - accompaniment (bass + drums + other mixed)
  - bass
  - drums
"""

import os
import tempfile
import logging
import subprocess
from pathlib import Path
from typing import Optional

import torch
import boto3

logger = logging.getLogger(__name__)

# Lazy-loaded model reference
_demucs_loaded = False

S3_BUCKET = os.environ["S3_BUCKET"]
s3_client = boto3.client(
    "s3",
    region_name=os.environ.get("AWS_REGION", "us-east-1"),
    aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
)


def load_demucs_model() -> None:
    """Pre-warm demucs by importing and checking torch."""
    global _demucs_loaded
    try:
        import demucs.separate  # noqa: F401
        _demucs_loaded = True
        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Demucs ready. Device: {device}")
    except ImportError as e:
        logger.warning(f"Demucs not available: {e}")


def _download_audio(audio_url: str, dest_path: Path, recording_id: str, file_format: str) -> Path:
    """Download audio from pre-signed S3 URL or S3 key."""
    import httpx

    dest_file = dest_path / f"original.{file_format}"
    logger.info(f"Downloading audio for {recording_id}...")

    with httpx.Client(timeout=300) as client:
        with client.stream("GET", audio_url) as response:
            response.raise_for_status()
            with open(dest_file, "wb") as f:
                for chunk in response.iter_bytes(chunk_size=8192):
                    f.write(chunk)

    logger.info(f"Downloaded {dest_file.stat().st_size / 1024:.1f} KB")
    return dest_file


def _upload_stem(local_path: Path, s3_key: str) -> str:
    """Upload a stem WAV file to S3."""
    s3_client.upload_file(
        str(local_path),
        S3_BUCKET,
        s3_key,
        ExtraArgs={"ContentType": "audio/wav"},
    )
    logger.info(f"Uploaded stem to s3://{S3_BUCKET}/{s3_key}")
    return s3_key


def separate_audio(
    audio_url: str,
    recording_id: str,
    user_id: str,
    file_format: str = "webm",
) -> dict[str, str]:
    """
    Run Demucs source separation on the given audio.

    Returns dict with S3 keys for each stem:
      vocals_s3_key, accompaniment_s3_key, bass_s3_key, drums_s3_key
    """
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)
        work_dir = tmp_path / "demucs_out"
        work_dir.mkdir()

        # Step 1: Download original audio
        audio_file = _download_audio(audio_url, tmp_path, recording_id, file_format)

        # Step 2: Convert to WAV if needed (demucs handles most formats but WAV is cleanest)
        wav_file = tmp_path / "input.wav"
        logger.info("Converting to WAV with ffmpeg...")
        subprocess.run(
            [
                "ffmpeg", "-y",
                "-i", str(audio_file),
                "-ar", "44100",       # Demucs prefers 44.1kHz
                "-ac", "2",           # Stereo
                "-c:a", "pcm_s16le",  # 16-bit PCM
                str(wav_file),
            ],
            check=True,
            capture_output=True,
        )

        # Step 3: Run Demucs
        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Running Demucs htdemucs_ft on {device}...")

        subprocess.run(
            [
                "python", "-m", "demucs.separate",
                "--name", "htdemucs_ft",
                "--device", device,
                "--out", str(work_dir),
                "--mp3",               # Output as mp3 to save space, then convert
                str(wav_file),
            ],
            check=True,
            capture_output=True,
        )

        # Demucs outputs to: work_dir/htdemucs_ft/input/{stem}.mp3
        stems_dir = work_dir / "htdemucs_ft" / "input"
        if not stems_dir.exists():
            raise RuntimeError(f"Demucs output directory not found: {stems_dir}")

        # Step 4: Convert stems to WAV + create accompaniment mix
        stem_names = ["vocals", "bass", "drums", "other"]
        stem_wavs: dict[str, Path] = {}

        for stem in stem_names:
            src = stems_dir / f"{stem}.mp3"
            dst = tmp_path / f"{stem}.wav"
            subprocess.run(
                ["ffmpeg", "-y", "-i", str(src), "-ar", "22050", "-ac", "1", str(dst)],
                check=True, capture_output=True,
            )
            stem_wavs[stem] = dst

        # Mix bass + drums + other → accompaniment
        accompaniment_wav = tmp_path / "accompaniment.wav"
        subprocess.run(
            [
                "ffmpeg", "-y",
                "-i", str(stem_wavs["bass"]),
                "-i", str(stem_wavs["drums"]),
                "-i", str(stem_wavs["other"]),
                "-filter_complex", "amix=inputs=3:duration=longest",
                str(accompaniment_wav),
            ],
            check=True, capture_output=True,
        )

        # Step 5: Upload all stems to S3
        base_key = f"recordings/{user_id}/{recording_id}/stems"

        vocals_key = _upload_stem(stem_wavs["vocals"], f"{base_key}/vocals.wav")
        backing_key = _upload_stem(accompaniment_wav, f"{base_key}/accompaniment.wav")
        bass_key = _upload_stem(stem_wavs["bass"], f"{base_key}/bass.wav")
        drums_key = _upload_stem(stem_wavs["drums"], f"{base_key}/drums.wav")

        return {
            "vocals_s3_key": vocals_key,
            "accompaniment_s3_key": backing_key,
            "bass_s3_key": bass_key,
            "drums_s3_key": drums_key,
        }
