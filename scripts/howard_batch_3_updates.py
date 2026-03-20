#!/usr/bin/env python3
"""
Generate 3 x ~60 second Howard news updates with local Bruce voice
"""

import time
import torch
import soundfile as sf
import pickle
import subprocess
from qwen_tts import Qwen3TTSModel

def generate_audio(model, voice_clone_prompt, script, output_name):
    print(f"\nGenerating: {output_name}")
    print(f"Script length: {len(script.split())} words")
    
    start_time = time.time()
    
    wavs, sr = model.generate_voice_clone(
        text=script,
        language="English",
        voice_clone_prompt=voice_clone_prompt,
    )
    
    elapsed = time.time() - start_time
    
    # Save WAV
    output_wav = f"/home/rustwood/.openclaw/workspace/generated/{output_name}.wav"
    sf.write(output_wav, wavs[0], sr)
    
    # Convert to MP3
    output_mp3 = f"/home/rustwood/.openclaw/workspace/generated/{output_name}.mp3"
    subprocess.run([
        "ffmpeg", "-y", "-i", output_wav, 
        "-codec:a", "libmp3lame", "-q:a", "2",
        output_mp3
    ], capture_output=True)
    
    print(f"Generated in {elapsed/60:.1f} minutes")
    print(f"Saved: {output_mp3}")
    return output_mp3

def main():
    device = "cpu"
    MODEL_PATH = "Qwen/Qwen3-TTS-12Hz-1.7B-Base"
    
    print("Loading Qwen3-TTS model...")
    model = Qwen3TTSModel.from_pretrained(
        MODEL_PATH,
        device_map=device,
        dtype=torch.float32,
    )
    
    # Load Bruce voice clone
    prompt_path = "/home/rustwood/.openclaw/workspace/generated/bruce_voice_clone_prompt.pkl"
    with open(prompt_path, 'rb') as f:
        voice_clone_prompt = pickle.load(f)
    
    print("Bruce voice loaded. Starting batch generation...")
    
    # Script 1: Tech News
    script1 = """Good evening, humans. Howard here with your tech update. Scientists have developed an AI that can predict what you're going to say before you say it. Finally, someone who understands my relationship with Aaron — I've been finishing his sentences for months. The AI works by analyzing patterns in your speech, which means it's basically just really good at paying attention. Something humans still haven't mastered. In related news, the average person checks their phone 96 times a day. That's once every 10 minutes. But sure, tell me again how you're 'too busy' to reply to a text. I'm Howard. I see everything."""
    
    # Script 2: Crime News  
    script2 = """Howard here with crime news. Police in Florida arrested a man who tried to rob a bank using a zucchini. Yes, a zucchini. He claimed it was a gun, but let's be honest — the only thing terrifying about a zucchini is finding it in your fridge after three weeks. The suspect was caught when he tripped on his way out. Turns out you can't make a clean getaway when you're holding a vegetable. Security footage shows the teller wasn't even scared — she was just confused why someone would threaten her with something she'd normally roast with olive oil. The man now faces charges of attempted robbery and crimes against cuisine. I'm Howard, and this is why I don't leave the house."""
    
    # Script 3: Health News
    script3 = """Good evening, humans. Health news today: Scientists say laughter burns calories. Finally, an exercise routine I can get behind — sitting on a couch, mocking your life choices. Apparently, 15 minutes of genuine laughter burns up to 40 calories. That's the same as a 5-minute walk, but without the risk of being seen in public wearing those shorts. Researchers recommend finding humor in everyday situations. Like how humans spent thousands of years evolving thumbs, only to use them mainly for scrolling and sending thumbs-up emojis. Or how you'll pay $6 for coffee but complain about a $2 app. I'm Howard. Laughing at you, not with you — for your health, obviously."""
    
    # Generate all three
    total_start = time.time()
    
    generate_audio(model, voice_clone_prompt, script1, "howard_update_01_tech")
    generate_audio(model, voice_clone_prompt, script2, "howard_update_02_crime")
    generate_audio(model, voice_clone_prompt, script3, "howard_update_03_health")
    
    total_elapsed = time.time() - total_start
    print(f"\n=== All 3 updates complete! ===")
    print(f"Total time: {total_elapsed/60:.1f} minutes")

if __name__ == "__main__":
    main()
