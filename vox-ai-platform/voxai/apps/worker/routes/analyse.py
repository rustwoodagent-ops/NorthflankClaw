"""Routes: /worker/analyse"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.acoustic import analyse_audio
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class AnalyseRequest(BaseModel):
    audio_url: str
    recording_id: str
    user_id: str


@router.post("/analyse")
async def analyse(req: AnalyseRequest):
    try:
        result = analyse_audio(req.audio_url, req.recording_id, req.user_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.exception(f"Acoustic analysis failed for {req.recording_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
