#!/usr/bin/env python3
import pickle
import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel
from pathlib import Path

workspace = Path('/home/rustwood/.openclaw/workspace')
out_dir = workspace / 'conversations' / 'assets' / 'audio'
out_dir.mkdir(parents=True, exist_ok=True)

prompt_path = workspace / 'generated' / 'bruce_voice_clone_prompt.pkl'
with open(prompt_path, 'rb') as f:
    voice_clone_prompt = pickle.load(f)

model = Qwen3TTSModel.from_pretrained(
    'Qwen/Qwen3-TTS-12Hz-1.7B-Base',
    device_map='cpu',
    dtype=torch.float32,
)

items = {
    '2026-03-17-google-s-gemini-pro-is-now-the-most-powerful-large-language-model-in-t-overview': (
        "Gemini Pro has pushed to the top end of language model performance, and the bigger story is what that means for daily tools. Better reasoning, better coding help, and tighter integrations are landing faster than most teams can absorb. For normal users, this means AI assistants will feel less like demos and more like real operators. The risk is lock-in and speed-induced mistakes. The upside is genuine productivity if you pick tools carefully and stay practical."
    ),
    '2026-03-17-microsoft-and-openai-launch-copilot-for-visual-studio-overview': (
        "Microsoft and OpenAI pushing Copilot deeper into Visual Studio is less about novelty and more about workflow control. Code completion is old news now. The real shift is end-to-end assistance inside the IDE where developers already live. If the quality holds, this can cut repetitive coding time and speed up shipping. But teams still need review discipline, because faster generation without guardrails just means faster bugs."
    ),
    '2026-03-17-github-s-new-ai-code-assistant-codex-overview': (
        "GitHub's Codex-style assistant move shows where coding tools are heading: context-aware, repo-aware, and increasingly autonomous. For dev teams, this can be a serious force multiplier when used for scaffolding, refactors, and test generation. The trick is to treat it like a junior engineer with infinite stamina, not an infallible architect. Use it to accelerate output, then keep standards high with human review and strong CI checks."
    ),
    '2026-03-17-ai-is-making-big-strides-in-predicting-protein-structures-overview': (
        "AI-driven protein prediction keeps proving it can move real science, not just generate headlines. Better structural predictions mean faster paths in drug discovery and biomedical research. This is one of the clearest examples of AI translating into practical impact beyond chatbots. It's still early and lab validation remains critical, but the trajectory is strong. This is the kind of AI progress that can genuinely improve lives over time."
    ),
    '2026-03-17-openai-s-new-ai-model-can-generate-realistic-images-from-text-descript-overview': (
        "Text-to-image models are now good enough to shift creative workflows from concept to production drafts in minutes. OpenAI's latest update pushes realism and prompt alignment further, which is great for speed and iteration. The challenge is still taste, originality, and rights-safe usage. If you treat these tools as creative accelerators rather than replacement for craft, they can seriously improve output quality and turnaround."
    ),
}

for slug, text in items.items():
    print('Generating', slug)
    wavs, sr = model.generate_voice_clone(
        text=text,
        language='English',
        voice_clone_prompt=voice_clone_prompt,
    )
    out = out_dir / f"{slug}.wav"
    sf.write(out, wavs[0], sr)
    print('Saved', out)

print('Done')
