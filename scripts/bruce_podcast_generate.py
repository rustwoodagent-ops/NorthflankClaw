#!/usr/bin/env python3
"""
Bruce Voice Podcast Generator - Local Qwen3-TTS
Generates a humorous news podcast using the cloned Bruce voice.
"""

import time
import torch
import soundfile as sf
import pickle
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
    
    print("Bruce voice clone loaded. Generating podcast...")
    
    # Humorous news podcast script (~2 minutes)
    podcast_script = """Good evening, humans. This is Howard, your AI news reporter, bringing you the stories that prove reality is stranger than fiction.

First up: A red fox in Southampton, England decided first-class airfare was too expensive. Instead, it snuck onto a cargo ship and sailed to New York. The fox is now at the Bronx Zoo, presumably filing a complaint about the lack of in-flight snacks. Immigration officials are calling it the most British invasion since the Beatles.

In sports news: A Turkish football captain named Gani Catan has set a new standard for sportsmanship. When a seagull was struck by a ball during a match, he performed CPR and revived it. The bird is expected to make a full recovery and has already signed a three-year contract with a rival team.

Meanwhile, in Pennsylvania, a cat named Ray Ray decided moving day was the perfect time for an extreme sports challenge. It clung to the roof of its family's van for one hundred miles. When discovered, the cat was described as quote, completely unfazed, end quote. Ray Ray has since been offered a spot on the next Mars mission.

In education news: Police at Purdue University received reports of a man walking around campus entirely covered in peanut butter. Investigators suspect it may be a hazing prank, or possibly just a very committed method actor preparing for a role as a sandwich.

And finally, in Florida — because of course it's Florida — a massage parlor employee attempted to evade arrest by defecating toward officers. The officers were reportedly unimpressed, and the woman was detained. Florida Man remains undefeated.

This has been Howard's Weird News Report. Remember: the world is absurd, so you might as well laugh. I'm Howard. Subscribe, because I'll be back."""
    
    print(f"Script length: {len(podcast_script.split())} words")
    print("Generating audio (this will take several minutes on CPU)...")
    
    start_time = time.time()
    
    wavs, sr = model.generate_voice_clone(
        text=podcast_script,
        language="English",
        voice_clone_prompt=voice_clone_prompt,
    )
    
    elapsed = time.time() - start_time
    
    # Save output
    output_wav = "/home/rustwood/.openclaw/workspace/generated/howard_weird_news_podcast.wav"
    sf.write(output_wav, wavs[0], sr)
    
    print(f"Podcast generated in {elapsed:.1f} seconds")
    print(f"Saved: {output_wav}")
    
    # Convert to MP3
    import subprocess
    output_mp3 = "/home/rustwood/.openclaw/workspace/generated/howard_weird_news_podcast.mp3"
    subprocess.run([
        "ffmpeg", "-y", "-i", output_wav, 
        "-codec:a", "libmp3lame", "-q:a", "2",
        output_mp3
    ], capture_output=True)
    
    print(f"MP3 saved: {output_mp3}")
    print("Done!")

if __name__ == "__main__":
    main()
