#!/usr/bin/env python3
import argparse
import json
from pathlib import Path
from faster_whisper import WhisperModel


def to_srt_timestamp(seconds: float) -> str:
    ms = int((seconds % 1) * 1000)
    total = int(seconds)
    s = total % 60
    m = (total // 60) % 60
    h = total // 3600
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main():
    p = argparse.ArgumentParser(description="Fast Whisper speech-to-text / translation")
    p.add_argument("input", help="Path to input audio/video file")
    p.add_argument("--model", default="small", help="Whisper model size (tiny/base/small/medium/large-v3)")
    p.add_argument("--task", choices=["transcribe", "translate"], default="translate", help="translate = speech to English")
    p.add_argument("--language", default=None, help="Optional source language code (e.g. en, es, id)")
    p.add_argument("--device", default="cpu", choices=["cpu", "cuda", "auto"], help="Inference device")
    p.add_argument("--compute-type", default="int8", help="For CPU: int8/int8_float32; CUDA: float16")
    p.add_argument("--beam-size", type=int, default=5)
    p.add_argument("--vad-filter", action="store_true", default=True)
    p.add_argument("--no-vad-filter", dest="vad_filter", action="store_false")
    p.add_argument("--output-dir", default="output")
    args = p.parse_args()

    input_path = Path(args.input).expanduser().resolve()
    out_dir = Path(args.output_dir).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    if not input_path.exists():
        raise FileNotFoundError(f"Input not found: {input_path}")

    model = WhisperModel(args.model, device=args.device, compute_type=args.compute_type)
    segments, info = model.transcribe(
        str(input_path),
        task=args.task,
        language=args.language,
        beam_size=args.beam_size,
        vad_filter=args.vad_filter,
    )

    segments = list(segments)
    base = input_path.stem
    txt_path = out_dir / f"{base}.{args.task}.txt"
    srt_path = out_dir / f"{base}.{args.task}.srt"
    json_path = out_dir / f"{base}.{args.task}.json"

    full_text = "\n".join(seg.text.strip() for seg in segments if seg.text.strip())
    txt_path.write_text(full_text, encoding="utf-8")

    with srt_path.open("w", encoding="utf-8") as f:
        for i, seg in enumerate(segments, start=1):
            f.write(f"{i}\n")
            f.write(f"{to_srt_timestamp(seg.start)} --> {to_srt_timestamp(seg.end)}\n")
            f.write(seg.text.strip() + "\n\n")

    payload = {
        "input": str(input_path),
        "task": args.task,
        "language_detected": info.language,
        "language_probability": info.language_probability,
        "duration": info.duration,
        "segments": [
            {"start": s.start, "end": s.end, "text": s.text.strip()} for s in segments
        ],
    }
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    print("✅ Completed")
    print(f"Language: {info.language} (p={info.language_probability:.3f})")
    print(f"TXT:  {txt_path}")
    print(f"SRT:  {srt_path}")
    print(f"JSON: {json_path}")


if __name__ == "__main__":
    main()
