#!/usr/bin/env python3
"""Synthesize speech from a saved Qwen3-TTS voice clone prompt.

Usage:
  uv run python scripts/qwen3_voice_clone_synthesize.py \
    --voice-id qwen3tts_20260313_abcd1234 \
    --text "Hello from my cloned voice" \
    --language English \
    --out out.wav \
    --root /home/rustwood/.openclaw/workspace/voice_models
"""

import argparse
import os
import torch
import soundfile as sf
from qwen_tts import Qwen3TTSModel


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice-id", required=True)
    ap.add_argument("--text", required=True)
    ap.add_argument("--language", default="Auto")
    ap.add_argument("--out", required=True)
    ap.add_argument("--root", default="/home/rustwood/.openclaw/workspace/voice_models")
    ap.add_argument("--model", default="Qwen/Qwen3-TTS-12Hz-0.6B-Base")
    ap.add_argument("--device", default="cuda:0")
    ap.add_argument("--dtype", default="bfloat16", choices=["bfloat16", "float16", "float32"])
    ap.add_argument("--attn", default="flash_attention_2")
    args = ap.parse_args()

    dtype_map = {
        "bfloat16": torch.bfloat16,
        "float16": torch.float16,
        "float32": torch.float32,
    }

    prompt_path = os.path.join(args.root, "qwen3_tts", args.voice_id, "voice_clone_prompt.pt")
    if not os.path.exists(prompt_path):
        raise FileNotFoundError(f"Prompt not found: {prompt_path}")

    voice_clone_prompt = torch.load(prompt_path, map_location="cpu")

    model = Qwen3TTSModel.from_pretrained(
        args.model,
        device_map=args.device,
        dtype=dtype_map[args.dtype],
        attn_implementation=args.attn,
    )

    wavs, sr = model.generate_voice_clone(
        text=args.text,
        language=args.language,
        voice_clone_prompt=voice_clone_prompt,
    )
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    sf.write(args.out, wavs[0], sr)
    print(args.out)


if __name__ == "__main__":
    main()
