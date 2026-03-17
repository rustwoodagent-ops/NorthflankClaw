#!/usr/bin/env python3
"""
Bruce Voice Podcast Generator - 45 Second Version
Shorter test that will actually complete on CPU.
"""

import time
import torch
import soundfile as sf
import pickle
import subprocess
from qwen_tts import Qwen3TTSModel

def main():
    device = "cpu"
    MODEL_PATH = "Qwen/Qwen3-TTS-12Hz-1.7B-Base"
    
    print(f"Loading Qwen3-TTS model...")
    
    model = Qwen3TTSModel.from_pretrained(
        MODEL_PATH,
        device_map=device,
        dtype=torch.float32,
    )
    
    # Load the Bruce voice clone prompt
    prompt_path = "/home/rustwood/.openclaw/workspace/generated/bruce_voice_clone_prompt.pkl"
    with open(prompt_path, 'rb') as f:
        voice_clone_prompt = pickle.load(f)
    
    print("Bruce voice clone loaded. Generating 45-second podcast...")
    
    # Shorter humorous news script (~45 seconds)
    podcast_script = """Good evening, humans. This is Howard with your weird news update.

A red fox in England snuck onto a cargo ship and sailed to New York. The fox is now at the Bronx Zoo, presumably complaining about the lack of in-flight snacks.

Meanwhile, a Turkish football captain performed CPR on a seagull struck by a ball and revived it. The bird has already signed with a rival team.

And in Florida — because it's always Florida — a massage parlor employee tried to evade arrest by defecating toward officers. Florida Man remains undefeated.

This has been Howard's Weird News. I'm Howard. Subscribe, because I'll be back."""
    
    print(f"Script length: {len(podcast_script.split())} words")
    print("Generating audio...")
    
    start_time = time.time()
    
    wavs, sr = model.generate_voice_clone(
        text=podcast_script,
        language="English",
        voice_clone_prompt=voice_clone_prompt,
    )
    
    elapsed = time.time() - start_time
    
    # Save output
    output_wav = "/home/rustwood/.openclaw/workspace/generated/howard_weird_news_45sec.wav"
    sf.write(output_wav, wavs[0], sr)
    
    print(f"Generated in {elapsed:.1f} seconds")
    
    # Convert to MP3
    output_mp3 = "/home/rustwood/.openclaw/workspace/generated/howard_weird_news_45sec.mp3"
    subprocess.run([
        "ffmpeg", "-y", "-i", output_wav, 
        "-codec:a", "libmp3lame", "-q:a", "2",
        output_mp3
    ], capture_output=True)
    
    print(f"MP3 saved: {output_mp3}")
    print("Done!")

if __name__ == "__main__":
    main()
