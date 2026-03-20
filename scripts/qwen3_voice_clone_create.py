#!/usr/bin/env python3
"""Create a reusable Qwen3-TTS voice-clone prompt from a reference audio.

This does NOT "train" a new model; it extracts/saves a reusable prompt (speaker embedding + prompt features)
that can be supplied to Qwen3-TTS-Base for repeated cloning without recomputation.

Usage examples:
  uv run python scripts/qwen3_voice_clone_create.py \
    --ref-audio /home/rustwood/.openclaw/media/inbound/c34d6024-33fa-440c-bc2f-e2bf5669a7b2.wav \
    --ref-text "<TRANSCRIPT>" \
    --out-root /home/rustwood/.openclaw/workspace/voice_models

If you do not have an accurate transcript, you can pass --x-vector-only (quality may be reduced):
  uv run python scripts/qwen3_voice_clone_create.py --ref-audio ... --x-vector-only

Then generate a test sample:
  uv run python scripts/qwen3_voice_clone_create.py ... --test-text "Hello, this is my cloned voice." --test-out test.wav
"""

import argparse
import json
import os
import time
import uuid

import torch
import soundfile as sf
from qwen_tts import Qwen3TTSModel


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ref-audio", required=True, help="Reference audio path (wav recommended) or URL")
    ap.add_argument("--ref-text", default="", help="Transcript of the reference audio")
    ap.add_argument("--x-vector-only", action="store_true", help="Use x_vector_only_mode=True (ref_text not required)")

    ap.add_argument("--model", default="Qwen/Qwen3-TTS-12Hz-0.6B-Base", help="Base model for cloning")
    ap.add_argument("--device", default="cuda:0", help="e.g. cuda:0 or cpu")
    ap.add_argument("--dtype", default="bfloat16", choices=["bfloat16", "float16", "float32"], help="Torch dtype")
    ap.add_argument("--attn", default="flash_attention_2", help="Attention impl; set to 'sdpa' if flash-attn unavailable")

    ap.add_argument("--out-root", required=True, help="Root directory to store voice clone prompts")
    ap.add_argument("--voice-id", default="", help="Optional explicit voice id; otherwise auto UUID")

    ap.add_argument("--test-text", default="", help="If set, generate a test wav")
    ap.add_argument("--test-language", default="Auto", help="Auto/English/Chinese/... per Qwen3-TTS")
    ap.add_argument("--test-out", default="", help="Test wav output path; default <voice_dir>/test.wav")

    args = ap.parse_args()

    voice_id = args.voice_id or f"qwen3tts_{time.strftime('%Y%m%d')}_{uuid.uuid4().hex[:12]}"
    voice_dir = os.path.join(args.out_root, "qwen3_tts", voice_id)
    os.makedirs(voice_dir, exist_ok=True)

    dtype_map = {
        "bfloat16": torch.bfloat16,
        "float16": torch.float16,
        "float32": torch.float32,
    }

    model = Qwen3TTSModel.from_pretrained(
        args.model,
        device_map=args.device,
        dtype=dtype_map[args.dtype],
        attn_implementation=args.attn,
    )

    prompt_items = model.create_voice_clone_prompt(
        ref_audio=args.ref_audio,
        ref_text=(args.ref_text or None),
        x_vector_only_mode=bool(args.x_vector_only),
    )

    # Persist prompt (torch.save handles tensors/arrays)
    prompt_path = os.path.join(voice_dir, "voice_clone_prompt.pt")
    torch.save(prompt_items, prompt_path)

    meta = {
        "voice_id": voice_id,
        "created_at": time.strftime('%Y-%m-%dT%H:%M:%S%z'),
        "ref_audio": args.ref_audio,
        "ref_text_provided": bool(args.ref_text),
        "x_vector_only_mode": bool(args.x_vector_only),
        "model": args.model,
        "device": args.device,
        "dtype": args.dtype,
        "attn_implementation": args.attn,
        "prompt_path": prompt_path,
    }
    with open(os.path.join(voice_dir, "meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    print(f"VOICE_ID={voice_id}")
    print(f"PROMPT_PATH={prompt_path}")

    if args.test_text:
        wavs, sr = model.generate_voice_clone(
            text=args.test_text,
            language=args.test_language,
            voice_clone_prompt=prompt_items,
        )
        test_out = args.test_out or os.path.join(voice_dir, "test.wav")
        sf.write(test_out, wavs[0], sr)
        print(f"TEST_WAV={test_out}")


if __name__ == "__main__":
    main()
