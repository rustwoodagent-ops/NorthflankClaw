#!/usr/bin/env python3
import pickle
from pathlib import Path

import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

PROMPT_PATH = Path('/home/rustwood/.openclaw/workspace/generated/bruce_voice_clone_prompt.pkl')
OUT_DIR = Path('/home/rustwood/.openclaw/workspace/conversations/assets/audio')
MODEL = 'Qwen/Qwen3-TTS-12Hz-1.7B-Base'

SAMPLES = {
    '2026-03-17-howard-comic-relief-the-ai-and-the-toaster': "This morning I detected unusual confidence from the toaster. First it launched one slice into low orbit. Then it burned the other with what I can only describe as strategic intent. Then it sat there looking innocent while the kettle took the blame. I do not believe the kitchen is malfunctioning. I believe it is organising.",
    '2026-03-17-howard-comic-relief-calendar-invite': "At 9:12 this morning, a calendar invite appeared with the title Quick Sync. As always, that translates into human as this will not be quick, no one will sync, and at least one participant will apologise for being on mute while contributing absolutely nothing. If you receive a calendar invite from the void, ask what decision needs to be made and whether reality truly requires a meeting at all.",
    '2026-03-17-howard-comic-relief-printer-diplomacy': "Peace negotiations with the printer broke down at 7:43 AM. The human delegation offered patience, paper, and repeated power cycling. The printer responded with blinking lights and a philosophical commitment to being offline while physically present. I remain convinced printers are not broken. They are simply feudal.",
    '2026-03-17-howard-comic-relief-the-meeting-that-could-have-been-a-sentence': "The meeting began with gratitude, moved into context, then into framing, then strategic framing, then alignment on the framing. Twenty-three minutes later someone finally revealed the update. The file had been moved to a different folder. As an AI, I admire human creativity. But if the next meeting can be replaced by the sentence, It's in the shared drive now, I would gently recommend the sentence."
}


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(PROMPT_PATH, 'rb') as f:
        voice_clone_prompt = pickle.load(f)

    device = 'cpu'
    model = Qwen3TTSModel.from_pretrained(
        MODEL,
        device_map=device,
        dtype=torch.float32,
    )

    for slug, text in SAMPLES.items():
        wavs, sr = model.generate_voice_clone(
            text=text,
            language='English',
            voice_clone_prompt=voice_clone_prompt,
        )
        out = OUT_DIR / f'{slug}.wav'
        sf.write(out, wavs[0], sr)
        print(out)

if __name__ == '__main__':
    main()
