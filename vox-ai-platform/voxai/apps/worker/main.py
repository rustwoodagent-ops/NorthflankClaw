"""
VOX AI Python Audio Worker
FastAPI microservice for source separation, transcription, and acoustic analysis.
Called by the Node.js BullMQ worker via HTTP.

Usage:
    pip install -r requirements.txt
    uvicorn main:app --host 0.0.0.0 --port 8001
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from routes.separate import router as separate_router
from routes.transcribe import router as transcribe_router
from routes.analyse import router as analyse_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("VOX AI Python Worker starting up...")
    # Pre-load models at startup to avoid cold start on first request
    from services.transcription import load_whisper_model
    from services.separation import load_demucs_model
    load_whisper_model()
    load_demucs_model()
    logger.info("Models loaded. Worker ready.")
    yield
    logger.info("Worker shutting down.")


app = FastAPI(
    title="VOX AI Audio Worker",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

app.include_router(separate_router, prefix="/worker")
app.include_router(transcribe_router, prefix="/worker")
app.include_router(analyse_router, prefix="/worker")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "voxai-python-worker"}
