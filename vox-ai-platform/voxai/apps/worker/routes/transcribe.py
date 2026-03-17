"""Routes: /worker/transcribe"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.transcription import transcribe_audio
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class TranscribeRequest(BaseModel):
    audio_url: str
    recording_id: str


@router.post("/transcribe")
async def transcribe(req: TranscribeRequest):
    try:
        result = transcribe_audio(req.audio_url, req.recording_id)
        return result
    except Exception as e:
        logger.exception(f"Transcription failed for {req.recording_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
