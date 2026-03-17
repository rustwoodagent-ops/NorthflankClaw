# Qwen3-TTS voice clone (runbook)

## Inputs
- OGG (Opus) ref audio: `/home/rustwood/.openclaw/media/inbound/c34d6024-33fa-440c-bc2f-e2bf5669a7b2.ogg`

## 1) Convert to WAV (recommended)
```bash
ffmpeg -y -i /home/rustwood/.openclaw/media/inbound/c34d6024-33fa-440c-bc2f-e2bf5669a7b2.ogg \
  -ac 1 -ar 24000 -c:a pcm_s16le \
  /home/rustwood/.openclaw/media/inbound/c34d6024-33fa-440c-bc2f-e2bf5669a7b2.wav
```
(24kHz mono is a safe default; Qwen3-TTS will resample internally if needed.)

## 2) Install deps
```bash
uv pip install -U qwen-tts soundfile
```
If you have a compatible GPU and want better memory/speed:
```bash
uv pip install -U flash-attn --no-build-isolation
```

## 3) Create & save reusable clone prompt ("voice id")
If you have an accurate transcript of the reference audio, pass `--ref-text`.
If not, use `--x-vector-only` (slightly lower similarity).

```bash
uv run python /home/rustwood/.openclaw/workspace/scripts/qwen3_voice_clone_create.py \
  --ref-audio /home/rustwood/.openclaw/media/inbound/c34d6024-33fa-440c-bc2f-e2bf5669a7b2.wav \
  --x-vector-only \
  --out-root /home/rustwood/.openclaw/workspace/voice_models \
  --test-text "Hello Aaron, this is a Qwen3-TTS voice clone test." \
  --test-language English
```

Outputs:
- `VOICE_ID=...`
- Prompt saved at: `voice_models/qwen3_tts/<VOICE_ID>/voice_clone_prompt.pt`
- Test audio at: `voice_models/qwen3_tts/<VOICE_ID>/test.wav`

## 4) Reuse later
Load `voice_clone_prompt.pt` and pass it as `voice_clone_prompt=...` into `generate_voice_clone`.
