# Fast-Whisper Voice Translation Setup

## Objective
Speech-to-text + speech translation (to English) using `faster-whisper`.

## Install

```bash
cd /home/rustwood/.openclaw/workspace/integrations/fast-whisper
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
```

## Usage

### Translate speech to English

```bash
source .venv/bin/activate
python scripts/voice_translate.py /path/to/audio.mp3 --task translate --model small
```

### Transcribe in source language

```bash
source .venv/bin/activate
python scripts/voice_translate.py /path/to/audio.mp3 --task transcribe --model small
```

## Outputs
Written to `output/`:
- `*.txt` full text
- `*.srt` subtitles
- `*.json` timestamped segments + metadata

## Performance notes
- CPU default uses `--compute-type int8` for speed.
- For higher accuracy: use `--model medium` or `--model large-v3`.
- For GPU: `--device cuda --compute-type float16`.
