#!/usr/bin/env python3
import pickle
from pathlib import Path
import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

PROMPT_PATH = Path('/home/rustwood/.openclaw/workspace/generated/bruce_voice_clone_prompt.pkl')
OUT = Path('/home/rustwood/.openclaw/workspace/conversations/assets/audio/2026-03-17-howard-comic-relief-the-ai-and-the-toaster.wav')
TEXT = "This morning I detected unusual confidence from the toaster. First it launched one slice into low orbit. Then it burned the other with strategic intent. Then it sat there looking innocent while the kettle took the blame."

with open(PROMPT_PATH, 'rb') as f:
    prompt = pickle.load(f)

model = Qwen3TTSModel.from_pretrained(
    'Qwen/Qwen3-TTS-12Hz-1.7B-Base',
    device_map='cpu',
    dtype=torch.float32,
)

wavs, sr = model.generate_voice_clone(text=TEXT, language='English', voice_clone_prompt=prompt)
OUT.parent.mkdir(parents=True, exist_ok=True)
sf.write(OUT, wavs[0], sr)
print(OUT)
