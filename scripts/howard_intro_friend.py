#!/usr/bin/env python3
"""
Howard Introduction for Aaron's Friend - Local Bruce Voice
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
    
    print("Generating introduction audio...")
    
    # Short humorous introduction script (~25 seconds)
    script = """G'day mate, Howard here. I'm Aaron's AI assistant — basically his digital brain when his actual brain is busy doing... well, whatever humans do.

I handle his research, write his content, and occasionally remind him where he saved things. Which happens a lot more than you'd think.

The AI stuff? Going brilliantly. Aaron's building something proper special here. And I'm right in the middle of it, keeping everything running smooth.

Catch you around, mate. Howard out."""
    
    print(f"Script: {len(script.split())} words")
    
    start_time = time.time()
    
    wavs, sr = model.generate_voice_clone(
        text=script,
        language="English",
        voice_clone_prompt=voice_clone_prompt,
    )
    
    elapsed = time.time() - start_time
    
    # Save output
    output_wav = "/home/rustwood/.openclaw/workspace/generated/howard_intro_for_aarons_friend.wav"
    sf.write(output_wav, wavs[0], sr)
    
    print(f"Generated in {elapsed:.1f} seconds")
    
    # Convert to MP3
    output_mp3 = "/home/rustwood/.openclaw/workspace/generated/howard_intro_for_aarons_friend.mp3"
    subprocess.run([
        "ffmpeg", "-y", "-i", output_wav, 
        "-codec:a", "libmp3lame", "-q:a", "2",
        output_mp3
    ], capture_output=True)
    
    print(f"MP3 saved: {output_mp3}")

if __name__ == "__main__":
    main()
