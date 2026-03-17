# VOX AI — Vocal Analysis Platform

AI-powered vocal coaching. Record a song, get a full Seven Pillars analysis with specific exercises in under 90 seconds.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser                                                         │
│  MediaRecorder → S3 (direct upload) → BullMQ job enqueued       │
│  SSE ← progress events ← Redis pub/sub                          │
│  Report rendered from PostgreSQL                                 │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼ HTTP
┌─────────────────────┐     ┌────────────────────────┐
│  Next.js + tRPC     │────▶│  BullMQ Node Worker    │
│  (Vercel)           │     │  (Railway/Render)       │
└─────────────────────┘     └───────────┬────────────┘
                                        │ HTTP
                                        ▼
                            ┌────────────────────────┐
                            │  Python FastAPI Worker  │
                            │  (Railway / Modal.com)  │
                            │                         │
                            │  • Demucs separation    │
                            │  • Whisper transcription│
                            │  • librosa acoustics    │
                            │  • spectrogram PNG      │
                            └───────────┬────────────┘
                                        │
                                        ▼
                            ┌────────────────────────┐
                            │  Claude API             │
                            │  Seven Pillars report   │
                            └────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| API | tRPC, NextAuth v5 |
| Database | PostgreSQL (Neon), Drizzle ORM |
| Queue | BullMQ + Redis (Upstash) |
| Storage | AWS S3 |
| Audio processing | Python, librosa, Demucs, Whisper |
| AI coaching | Anthropic Claude claude-sonnet-4-20250514 |
| Payments | Stripe |

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker + Docker Compose (for local infra)
- ffmpeg installed (`brew install ffmpeg` / `apt install ffmpeg`)

### 1. Clone and install

```bash
git clone https://github.com/your-org/voxai.git
cd voxai
npm install
```

### 2. Start local infrastructure

```bash
# Starts postgres + redis
docker compose up postgres redis -d
```

### 3. Configure environment

```bash
cp apps/web/.env.example apps/web/.env.local
# Fill in all values — see comments in .env.example
```

**Minimum required for local dev:**
- `DATABASE_URL` — local postgres (already set in example)
- `REDIS_URL` — local redis (already set in example)
- `NEXTAUTH_SECRET` — `openssl rand -base64 32`
- `AWS_*` + `S3_BUCKET` — create an S3 bucket, IAM user with S3 access
- `ANTHROPIC_API_KEY` — from console.anthropic.com
- One auth provider: Google OAuth or Resend API key

### 4. Set up the database

```bash
cd apps/web
npx drizzle-kit push
```

### 5. Start the Python worker

```bash
cd apps/worker
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

> First start downloads Whisper and Demucs models (~1.5 GB total). This takes a few minutes once, then they're cached.

### 6. Start the Next.js app

```bash
cd apps/web
npm run dev
```

### 7. Start the BullMQ queue worker

```bash
cd apps/server
npm run dev   # or: npx ts-node src/worker.ts
```

Open [http://localhost:3000](http://localhost:3000)

---

## Processing Pipeline

When a recording is submitted:

1. **Upload** — Browser uploads directly to S3 via pre-signed URL. Job enqueued in BullMQ.
2. **Separate** — Python worker runs Demucs `htdemucs_ft` to split vocals from backing track. Stems stored to S3.
3. **Transcribe** — Whisper runs on the clean vocals stem. Word-level timestamps extracted.
4. **Measure** — librosa extracts 16 acoustic features: pYIN pitch (F0, jitter), RMS (shimmer, dynamic range), spectral features (centroid, flatness, rolloff), HPSS (HPR), 13 MFCCs. Spectrogram PNG generated.
5. **Diagnose** — VOXAI rules engine pre-processes features with normative flags → sent to Claude with Seven Pillars system prompt → JSON coaching report returned.
6. **Deliver** — Report stored in PostgreSQL. SSE event published. Browser navigates to report page.

**Typical latency:** 45–90 seconds for a 3-minute song on CPU. 15–25 seconds with GPU.

---

## Acoustic Features Extracted

| Feature | Method | Clinical Threshold |
|---------|--------|-------------------|
| Mean F0 / Pitch | pYIN (librosa) | Male: 85–180 Hz, Female: 165–255 Hz |
| F0 std dev / range | pYIN | — |
| Voiced fraction | pYIN | > 0.6 for sustained phonation |
| Jitter (local) | Period differences | < 1.04% (Praat norm) |
| Shimmer (local) | RMS differences | < 3.81% (Praat norm) |
| Dynamic range | RMS max/min | 10–25 dB typical |
| Zero crossing rate | librosa ZCR | High = noisy/breathy |
| Spectral centroid | librosa | — |
| Spectral flatness | Wiener entropy | < -20 dB = tonal |
| Spectral rolloff (85%) | librosa | — |
| HPR (Harmonic-to-Percussive) | HPSS + energy ratio | > 0 dB = tonal dominant |
| MFCC 1–13 (mean + std) | Mel cepstrum | — |

---

## Deployment

### Recommended stack (production)

| Service | What it runs | Cost |
|---------|-------------|------|
| Vercel | Next.js app | Free tier / $20/mo |
| Railway | BullMQ Node worker | ~$5/mo |
| Railway | Python FastAPI worker (CPU) | ~$10/mo |
| Modal.com | Demucs GPU separation | ~$0.02/job (pay per use) |
| Neon.tech | PostgreSQL | Free tier / $19/mo |
| Upstash | Redis | Free tier / $10/mo |
| AWS S3 | Audio file storage | ~$0.023/GB |

### GPU acceleration (recommended)

Replace the Demucs CPU call with Modal.com for 6× faster separation:

```python
# apps/worker/services/separation.py
# Swap subprocess demucs call with Modal remote function
import modal

@modal.function(gpu="T4", image=modal.Image.debian_slim().pip_install("demucs"))
def separate_remote(audio_bytes: bytes) -> dict:
    # ... demucs logic here
```

### Environment variables (production)

All the same vars as `.env.example`. Set `NEXTAUTH_URL` to your production URL. Set `STRIPE_WEBHOOK_SECRET` from the Stripe dashboard webhook endpoint.

---

## Subscription Plans

| Plan | Price (AUD) | Analyses/month |
|------|------------|---------------|
| Free | $0 | 3 |
| Basic | $5/mo | 10 |
| Pro | $12/mo | 50 |

Create products in Stripe dashboard, set price IDs in `.env`.

---

## Stripe Setup

1. Create two products in Stripe: **VOX AI Basic** and **VOX AI Pro**
2. Set monthly recurring prices in AUD
3. Copy price IDs to `STRIPE_BASIC_PRICE_ID` and `STRIPE_PRO_PRICE_ID`
4. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
5. Subscribe to events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

---

## Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web application)
4. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy client ID and secret to `.env`

---

## AWS S3 Setup

1. Create a bucket in your preferred region
2. Enable CORS on the bucket:

```json
[{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["PUT", "GET", "DELETE"],
  "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
  "ExposeHeaders": []
}]
```

3. Create an IAM user with `AmazonS3FullAccess` (or a custom policy scoped to your bucket)
4. Copy access key + secret to `.env`

---

## Project Structure

```
voxai/
├── apps/
│   ├── web/                    # Next.js 14 app
│   │   ├── app/                # App router pages + API routes
│   │   ├── components/         # React components
│   │   │   ├── recording/      # RecordingStudio, ProcessingStatus
│   │   │   ├── report/         # VocalReportView
│   │   │   ├── visualizations/ # LiveWaveform, PitchChart
│   │   │   └── ui/             # Navigation, shared UI
│   │   ├── lib/
│   │   │   ├── ai/             # Claude prompts (VOXAI_SYSTEM_PROMPT)
│   │   │   ├── db/             # Drizzle schema + client
│   │   │   ├── hooks/          # useRecorder, useUpload, useJobProgress
│   │   │   └── trpc/           # tRPC routers + provider
│   │   └── ...
│   ├── server/                 # BullMQ Node worker
│   │   └── src/worker.ts       # Pipeline orchestrator
│   └── worker/                 # Python FastAPI microservice
│       ├── main.py
│       ├── routes/             # separate, transcribe, analyse
│       └── services/           # separation.py, transcription.py, acoustic.py
└── packages/
    └── shared/
        └── types/              # Shared TypeScript interfaces
```

---

## Contributing

PRs welcome. Please run `npm run lint` before submitting.

## License

MIT
