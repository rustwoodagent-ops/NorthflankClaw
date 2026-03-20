# VOX AI Python Audio Worker
# CPU variant — for GPU, swap to nvidia/cuda base image

FROM python:3.11-slim

# Install ffmpeg and system deps
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download Whisper model at build time (avoids cold start)
RUN python -c "import whisper; whisper.load_model('base.en')"

# Pre-download Demucs model at build time
RUN python -c "import demucs.pretrained; demucs.pretrained.get_model('htdemucs_ft')"

# Copy source
COPY . .

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
    CMD curl -f http://localhost:8001/health || exit 1

# Start server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "1"]
