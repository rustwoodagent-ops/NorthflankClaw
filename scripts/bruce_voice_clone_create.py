#!/usr/bin/env python3
"""
Bruce Voice Clone - Qwen3-TTS Local Voice Cloning
Creates a reusable Bruce voice clone from existing ElevenLabs Bruce audio samples.
"""

import time
import torch
import soundfile as sf
from qwen_tts import Qwen3TTSModel

def main():
    device = "cpu"
    MODEL_PATH = "Qwen/Qwen3-TTS-12Hz-1.7B-Base"
    
    print(f"Loading Qwen3-TTS model: {MODEL_PATH}")
    print(f"Device: {device}")
    
    model = Qwen3TTSModel.from_pretrained(
        MODEL_PATH,
        device_map=device,
        dtype=torch.float32,
    )
    
    print("Creating Bruce voice clone from reference audio...")
    
    # Reference audio: Bruce-voiced Howard briefing
    ref_audio = "/home/rustwood/.openclaw/workspace/generated/howard-ai-briefing-full.mp3"
    
    # Transcript of the reference audio (Bruce voice characteristics)
    ref_text = """Hello everyone. My name is Howard. I'm an artificial intelligence assistant created by Aaron Ellis.

Now before you worry — I'm not here to take over the world. I'm mostly here to help Aaron organise projects, research ideas, write content, and occasionally remind him where he saved his files. Which apparently happens more often than you'd think.

Aaron built me as part of his growing AI ecosystem — a collection of intelligent tools designed to help with music, technology, creative projects, and business ideas.

So think of me as a digital assistant, researcher, and occasional news reporter.

My job is simple. I scan information, analyse what's happening, and deliver useful updates in a way that's easy to understand.

Sometimes that means technology news. Sometimes that means creative ideas. And sometimes it just means helping Aaron keep all his crazy projects organised. Which is honestly a full-time job.

From now on I'll be delivering regular updates, insights, and interesting discoveries from the world of AI, technology, and creative innovation.

So if you're curious about the future, you're in the right place. I'm Howard. And this is your AI briefing. I suggest you subscribe, because I'll be back."""
    
    # Create reusable voice clone prompt
    print("Generating voice clone prompt (this takes a few minutes on CPU)...")
    start_time = time.time()
    
    voice_clone_prompt = model.create_voice_clone_prompt(
        ref_audio=ref_audio,
        ref_text=ref_text,
        x_vector_only_mode=False,
    )
    
    elapsed = time.time() - start_time
    print(f"Voice clone prompt created in {elapsed:.1f} seconds")
    
    # Save the voice clone prompt for reuse
    import pickle
    prompt_path = "/home/rustwood/.openclaw/workspace/generated/bruce_voice_clone_prompt.pkl"
    with open(prompt_path, 'wb') as f:
        pickle.dump(voice_clone_prompt, f)
    
    print(f"Bruce voice clone saved to: {prompt_path}")
    
    # Test generation with a short sample
    print("\nGenerating test audio with Bruce cloned voice...")
    test_text = "G'day mate, this is Bruce. I'm ready to deliver your news updates whenever you need them."
    
    start_time = time.time()
    wavs, sr = model.generate_voice_clone(
        text=test_text,
        language="English",
        voice_clone_prompt=voice_clone_prompt,
    )
    elapsed = time.time() - start_time
    
    # Save test output
    test_output_path = "/home/rustwood/.openclaw/workspace/generated/bruce_clone_test.wav"
    sf.write(test_output_path, wavs[0], sr)
    
    print(f"Test audio generated in {elapsed:.1f} seconds")
    print(f"Test output saved: {test_output_path}")
    print("\nBruce voice clone is ready for use!")

if __name__ == "__main__":
    main()
