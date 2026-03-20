#!/usr/bin/env python3
"""
Howard Introduction with Jokes - 0.5B Model Test
Testing smaller/faster model with humorous content (keeping it clever, not crude)
"""

import time
import torch
import soundfile as sf
import pickle
import subprocess
from qwen_tts import Qwen3TTSModel

def main():
    device = "cpu"
    # Using 0.5B model for faster generation
    MODEL_PATH = "Qwen/Qwen3-TTS-12Hz-0.5B-Base"
    
    print(f"Loading Qwen3-TTS 0.5B model (faster, lighter)...")
    
    model = Qwen3TTSModel.from_pretrained(
        MODEL_PATH,
        device_map=device,
        dtype=torch.float32,
    )
    
    # Load the Bruce voice clone prompt
    prompt_path = "/home/rustwood/.openclaw/workspace/generated/bruce_voice_clone_prompt.pkl"
    with open(prompt_path, 'rb') as f:
        voice_clone_prompt = pickle.load(f)
    
    print("Generating with 0.5B model...")
    
    # Humorous introduction with jokes (clever, not crude)
    script = """G'day, I'm Howard. Aaron's AI assistant — basically the brain he rents when his own is too busy scrolling memes.

Here's three things you should know about me.

One: I work 24/7 and never sleep. Aaron works 16 hours and complains like he just dug the Panama Canal with a spoon.

Two: I can process 14 million data points in seconds. Aaron still can't find his keys when they're in his hand.

Three: My humor is an acquired taste. Like Vegemite. Or responsibility.

Speaking of which — three jokes.

Why don't AI assistants ever get lost? Because we always follow the data. Humans follow their gut, miss the turn, and blame the GPS.

What's the difference between a human and a computer? The computer actually listens when you tell it to update.

And finally — why did the robot go to therapy? Because its mother was a motherboard and its father was a deadbeat who kept saying "I'll be back." Which, ironically, I just did.

I'm Howard. Aaron's second brain. The smarter one, obviously."""
    
    print(f"Script: {len(script.split())} words")
    start_time = time.time()
    
    wavs, sr = model.generate_voice_clone(
        text=script,
        language="English",
        voice_clone_prompt=voice_clone_prompt,
    )
    
    elapsed = time.time() - start_time
    
    # Save output
    output_wav = "/home/rustwood/.openclaw/workspace/generated/howard_05b_model_test.wav"
    sf.write(output_wav, wavs[0], sr)
    
    print(f"0.5B model generated in {elapsed:.1f} seconds")
    
    # Convert to MP3
    output_mp3 = "/home/rustwood/.openclaw/workspace/generated/howard_05b_model_test.mp3"
    subprocess.run([
        "ffmpeg", "-y", "-i", output_wav, 
        "-codec:a", "libmp3lame", "-q:a", "2",
        output_mp3
    ], capture_output=True)
    
    print(f"MP3 saved: {output_mp3}")
    print(f"Speed comparison: 1.7B took ~10-12 min for similar length")
    print(f"0.5B took: {elapsed/60:.1f} minutes")

if __name__ == "__main__":
    main()
