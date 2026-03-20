#!/usr/bin/env python3
"""Create a reusable Qwen3-TTS voice-clone prompt from a reference audio, then synthesize a test phrase.

Outputs:
  - <out_dir>/voice_clone_prompt.pt : torch-saved prompt object
  - <out_dir>/test.wav             : synthesized speech in cloned voice

Notes:
  - Best quality: provide ref_text (transcript). If you don't have it, pass --x-vector-only.
  - ref_audio should be a WAV if possible (e.g., 16kHz mono), but qwen-tts can accept many formats.

Example:
  python qwen_voice_clone.py --ref-audio ref.wav --language English \
    --out-dir out/clone1 --x-vector-only \
    --test-text "This is a test of my cloned voice."
"""

from __future__ import annotations

import argparse
import os
from pathlib import Path

import torch
import soundfile as sf

from qwen_tts import Qwen3TTSModel


def pick_device_and_dtype():
    if torch.cuda.is_available():
        dev = "cuda:0"
        # bfloat16 if supported, else float16
        bf16_ok = getattr(torch.cuda, "is_bf16_supported", lambda: False)()
        dtype = torch.bfloat16 if bf16_ok else torch.float16
        attn_impl = "flash_attention_2"
    else:
        dev = "cpu"
        dtype = torch.float32
        attn_impl = None
    return dev, dtype, attn_impl


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="Qwen/Qwen3-TTS-12Hz-0.6B-Base")
    ap.add_argument("--ref-audio", required=True)
    ap.add_argument("--ref-text", default=None)
    ap.add_argument("--language", default="Auto")
    ap.add_argument("--out-dir", required=True)
    ap.add_argument("--test-text", default="This is a test of the cloned voice. If you can hear this, the voice profile is working.")
    ap.add_argument("--x-vector-only", action="store_true", help="If set, only use speaker embedding; ref_text not required (lower quality).")
    args = ap.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    dev, dtype, attn_impl = pick_device_and_dtype()

    kwargs = dict(device_map=dev, dtype=dtype)
    if attn_impl and dev.startswith("cuda"):
        kwargs["attn_implementation"] = attn_impl

    model = Qwen3TTSModel.from_pretrained(args.model, **kwargs)

    if (not args.x_vector_only) and (not args.ref_text):
        raise SystemExit("ref_text is required unless --x-vector-only is set")

    prompt_items = model.create_voice_clone_prompt(
        ref_audio=args.ref_audio,
        ref_text=args.ref_text,
        x_vector_only_mode=bool(args.x_vector_only),
    )

    prompt_path = out_dir / "voice_clone_prompt.pt"
    torch.save(prompt_items, prompt_path)

    wavs, sr = model.generate_voice_clone(
        text=args.test_text,
        language=args.language,
        voice_clone_prompt=prompt_items,
    )

    test_path = out_dir / "test.wav"
    sf.write(test_path, wavs[0], sr)

    print(str(prompt_path))
    print(str(test_path))


if __name__ == "__main__":
    main()
