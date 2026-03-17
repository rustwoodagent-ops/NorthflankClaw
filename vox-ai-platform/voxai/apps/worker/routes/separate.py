"""Routes: /worker/separate"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.separation import separate_audio
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class SeparateRequest(BaseModel):
    audio_url: str
    recording_id: str
    user_id: str
    file_format: str = "webm"


@router.post("/separate")
async def separate(req: SeparateRequest):
    try:
        result = separate_audio(
            audio_url=req.audio_url,
            recording_id=req.recording_id,
            user_id=req.user_id,
            file_format=req.file_format,
        )
        return result
    except Exception as e:
        logger.exception(f"Separation failed for {req.recording_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
