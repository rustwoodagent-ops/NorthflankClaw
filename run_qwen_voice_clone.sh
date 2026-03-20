#!/usr/bin/env bash
set -euo pipefail

WS="/home/rustwood/.openclaw/workspace"
OUT_DIR="$WS/voice_clones/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUT_DIR"

# 1) Locate the most recent inbound audio file
SEARCH_ROOTS=(
  "/home/rustwood/.openclaw"
  "/home/rustwood/.openclaw/workspace"
)

LATEST_AUDIO=""
LATEST_TS=""

for root in "${SEARCH_ROOTS[@]}"; do
  [[ -d "$root" ]] || continue
  # common voice note formats from WhatsApp/Telegram/etc
  while IFS= read -r line; do
    ts="${line%% *}"
    path="${line#* }"
    if [[ -z "$LATEST_TS" || "$ts" > "$LATEST_TS" ]]; then
      LATEST_TS="$ts"
      LATEST_AUDIO="$path"
    fi
  done < <(find "$root" -type f \( -iname '*.opus' -o -iname '*.ogg' -o -iname '*.m4a' -o -iname '*.mp3' -o -iname '*.wav' -o -iname '*.webm' \) \
      -printf '%TY%Tm%Td%TH%TM%TS %p\n' 2>/dev/null | sort -r | head -n 50)

done

if [[ -z "$LATEST_AUDIO" ]]; then
  echo "ERROR: No audio files found under ${SEARCH_ROOTS[*]}" >&2
  echo "If you know the inbound media path, pass it as REF_AUDIO and re-run:" >&2
  echo "  REF_AUDIO=/path/to/file.opus $0" >&2
  exit 1
fi

REF_AUDIO="${REF_AUDIO:-$LATEST_AUDIO}"

echo "Using reference audio: $REF_AUDIO" >&2

# 2) Convert to a stable WAV (16kHz mono) for best compatibility
REF_WAV="$OUT_DIR/ref.wav"
if [[ "$REF_AUDIO" == *.wav ]]; then
  cp -f "$REF_AUDIO" "$REF_WAV"
else
  ffmpeg -y -hide_banner -loglevel error -i "$REF_AUDIO" -ar 16000 -ac 1 "$REF_WAV"
fi

# 3) Install qwen-tts (python) in the current environment
cd "$WS"
uv pip install -U qwen-tts soundfile >/dev/null

# 4) Create the reusable voice prompt + generate a test phrase
python "$WS/qwen_voice_clone.py" \
  --ref-audio "$REF_WAV" \
  --language "Auto" \
  --out-dir "$OUT_DIR" \
  --x-vector-only \
  --test-text "This is Howard testing a cloned voice profile. If this sounds like the reference speaker, the clone is ready." 

echo "OUT_DIR=$OUT_DIR" >&2
