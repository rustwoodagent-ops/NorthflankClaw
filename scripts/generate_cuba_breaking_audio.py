#!/usr/bin/env python3
import pickle
from pathlib import Path
import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

PROMPT_PATH = Path('/home/rustwood/.openclaw/workspace/generated/bruce_voice_clone_prompt.pkl')
OUT = Path('/home/rustwood/.openclaw/workspace/conversations/assets/audio/2026-03-17-cuba-suffers-complete-electrical-grid-collapse.wav')
TEXT = "Cuba has suffered a complete collapse of its national electrical grid, leaving millions without power and deepening the island's already severe energy crisis. Authorities confirmed a total disconnection of the national power system, but did not immediately provide a definitive technical cause. The collapse comes after months of fuel shortages, aging infrastructure, and repeated major blackouts. The practical consequence is that hospitals, refrigeration, water pumping, transport, and daily economic life all become more fragile while crews attempt a complex multi-stage restoration. The larger story is no longer just one outage. It is that complete grid failure is becoming part of the rhythm of the Cuban crisis."

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
