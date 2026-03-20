"""
Transcription Service
Uses OpenAI Whisper to transcribe vocals with word-level timestamps.
"""

import os
import tempfile
import logging
from pathlib import Path
from typing import Optional

import whisper
import httpx
import numpy as np

logger = logging.getLogger(__name__)

# Singleton model
_whisper_model: Optional[whisper.Whisper] = None
WHISPER_MODEL_SIZE = os.environ.get("WHISPER_MODEL", "base.en")


def load_whisper_model() -> whisper.Whisper:
    global _whisper_model
    if _whisper_model is None:
        logger.info(f"Loading Whisper model: {WHISPER_MODEL_SIZE}")
        _whisper_model = whisper.load_model(WHISPER_MODEL_SIZE)
        logger.info("Whisper model loaded.")
    return _whisper_model


def transcribe_audio(audio_url: str, recording_id: str) -> dict:
    """
    Transcribe vocals audio with word-level timestamps.

    Args:
        audio_url: Pre-signed S3 URL or direct URL to vocals WAV
        recording_id: For logging

    Returns:
        {
          "text": full transcript string,
          "words": [{word, start, end, confidence}],
          "no_speech_detected": bool
        }
    """
    model = load_whisper_model()

    with tempfile.TemporaryDirectory() as tmp_dir:
        audio_path = Path(tmp_dir) / "vocals.wav"

        # Download the audio
        logger.info(f"Downloading vocals for transcription [{recording_id}]...")
        with httpx.Client(timeout=300) as client:
            response = client.get(audio_url)
            response.raise_for_status()
            audio_path.write_bytes(response.content)

        logger.info(f"Transcribing {audio_path.stat().st_size / 1024:.1f} KB of audio...")

        # Run Whisper with word timestamps
        result = model.transcribe(
            str(audio_path),
            word_timestamps=True,
            language="en",
            # Suppress hallucinations on silence
            condition_on_previous_text=False,
            no_speech_threshold=0.6,
            logprob_threshold=-1.0,
            compression_ratio_threshold=2.4,
        )

        text: str = result["text"].strip()
        no_speech = not text or text.lower() in ["[blank_audio]", "[music]", "[applause]", ""]

        words = []
        if not no_speech:
            for segment in result.get("segments", []):
                for word_info in segment.get("words", []):
                    words.append({
                        "word": word_info["word"].strip(),
                        "start": round(float(word_info["start"]), 3),
                        "end": round(float(word_info["end"]), 3),
                        "confidence": round(float(word_info.get("probability", 0.0)), 3),
                    })

        logger.info(
            f"Transcription complete: {len(words)} words, "
            f"no_speech={no_speech}, text='{text[:80]}...'"
        )

        return {
            "text": text if not no_speech else "",
            "words": words,
            "no_speech_detected": no_speech,
        }
