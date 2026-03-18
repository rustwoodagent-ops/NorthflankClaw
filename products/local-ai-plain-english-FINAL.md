# Local AI in Plain English
## A Beginner's Guide to Running AI on Your Own Computer

---

## 1. What "Local AI" Actually Means

**Local AI means running artificial intelligence on your own computer instead of sending your data to someone else's servers.**

Think of it like the difference between:
- **Cloud AI** (ChatGPT, Claude): Writing your diary in a shared notebook at a friend's house
- **Local AI**: Writing your diary in a notebook that never leaves your desk

Both let you write. Only one guarantees privacy.

### How They Actually Work

**Cloud AI:**
1. You type a message
2. It travels across the internet to company servers
3. Their computers process it
4. Response comes back

**Local AI:**
1. You download the AI model (a large file, 2-50GB)
2. It lives on your hard drive
3. Your computer runs it
4. Your data never leaves

> **The trade-off:** Local AI trades convenience for control. Cloud AI trades control for convenience.

### When to Choose What

| Choose Local AI When... | Choose Cloud AI When... |
|------------------------|------------------------|
| Sensitive documents | Occasional use |
| Poor internet | Latest features (voice, vision) |
| No subscription budget | Mobile access priority |
| You want to customize | Zero setup hassle |

---

## 2. Tokens: The Basics

A **token** is the smallest unit of text AI processes. Not always a word—sometimes part of a word, sometimes punctuation.

**Rough guide:**
- 100 tokens ≈ 75 words
- 1,000 tokens ≈ 750 words
- 4,000 tokens ≈ 3,000 words (this section)

### Why Tokens Matter

1. **Cost:** Cloud AI charges per token
2. **Speed:** More tokens = slower response
3. **Limits:** Every model has a maximum token count

**Practical example:** Asking AI to summarize a 10-page document might use 3,000 tokens. A quick question uses 50-100.

---

## 3. Context Windows: How Much Can It Remember?

The **context window** is how much text the AI can "see" at once.

| Window Size | Roughly Fits | Good For |
|-------------|--------------|----------|
| 4K tokens | 3 pages | Quick questions, short emails |
| 8K tokens | 6 pages | Medium articles, code snippets |
| 16K tokens | 12 pages | Long documents, small reports |
| 32K+ tokens | 24+ pages | Books, large codebases, research |

**What happens when you exceed the window?** The AI forgets the beginning. It only sees the most recent text that fits.

**Practical tip:** For local models, 7K-16K context is the sweet spot for most tasks without slowing down your computer.

---

## 4. Model Types: Which One Do You Need?

AI models come in three main categories:

### Small Models (1B-7B parameters)
- **Size:** 1-5GB on disk
- **Speed:** Fast on most computers
- **Best for:** Simple tasks, quick answers, basic writing help
- **Examples:** Gemma 2B, Phi-3 Mini, Qwen 2.5 7B

### Medium Models (8B-20B parameters)
- **Size:** 5-15GB on disk
- **Speed:** Moderate (GPU recommended)
- **Best for:** Complex reasoning, coding, detailed analysis
- **Examples:** Llama 3.1 8B, GPT-OSS 20B, Qwen 2.5 14B

### Large Models (30B+ parameters)
- **Size:** 20GB+ on disk
- **Speed:** Slow without powerful GPU
- **Best for:** Advanced reasoning, creative writing, complex coding
- **Examples:** Qwen 3 30B, Llama 3.1 70B

### Quick Selection Guide

| Your Situation | Start With |
|----------------|------------|
| Basic laptop, no GPU | Small model (7B or less) |
| Gaming PC with 8GB+ VRAM | Medium model (8B-14B) |
| Powerful desktop, 16GB+ VRAM | Large model (30B+) |
| Just experimenting | Small model first |

---

## 5. Local vs Cloud: The Honest Comparison

| Factor | Local AI | Cloud AI |
|--------|----------|----------|
| **Privacy** | Complete | Trust required |
| **Cost** | Hardware only | Per-use or subscription |
| **Setup** | 30-60 minutes | Zero |
| **Internet** | Not needed | Required |
| **Speed** | Depends on hardware | Fast (their hardware) |
| **Updates** | Manual | Automatic |
| **Customization** | Full control | Limited |
| **Latest models** | Delayed | Immediate |

**The real question:** Do you want control enough to spend an hour setting it up?

---

## 6. Five Beginner Mistakes (And How to Avoid Them)

### Mistake 1: Downloading the Biggest Model
**Problem:** 70B model won't run on your laptop. It crashes or is unusably slow.
**Fix:** Start with 7B-14B. Scale up only when you know your hardware can handle it.

### Mistake 2: Ignoring Context Limits
**Problem:** Pasting a 50-page document into a 4K context model.
**Fix:** Check your model's limit. Break large documents into chunks.

### Mistake 3: Expecting ChatGPT Quality from Small Models
**Problem:** 2B model gives worse answers than GPT-4.
**Fix:** Match model size to task complexity. Small models are capable but not magical.

### Mistake 4: Not Quantizing
**Problem:** Running full-precision models that use 2x the RAM needed.
**Fix:** Use quantized versions (Q4_K_M, Q5_K_M). Minimal quality loss, major speed gain.

### Mistake 5: Giving Up After First Failure
**Problem:** One error message → "Local AI doesn't work."
**Fix:** First setup always has hiccups. The second time takes 10 minutes.

---

## 7. Quick-Start Checklist

### What You Need
- [ ] Computer with 8GB+ RAM (16GB+ recommended)
- [ ] 10GB+ free disk space
- [ ] Optional: NVIDIA GPU with 6GB+ VRAM (for speed)

### First Steps
1. **Install Ollama** (ollama.com) — the easiest way to run local models
2. **Download one small model:** `ollama run gemma:2b`
3. **Test it:** Ask a simple question
4. **Try a medium model:** `ollama run llama3.1:8b`
5. **Notice the difference:** Speed vs. quality trade-off

### Next Level
- Install a GUI like OpenWebUI or ChatGPT-Next-Web
- Try different models for different tasks
- Experiment with custom prompts

---

## What's Next

You now understand how local AI works. Time to put it to work.

**Your First AI Workflow** (free) shows you how to build one working automation — an email summarizer, a content generator, or a research assistant — using what you just learned.

No complex setup. No coding required. Just a working system you built yourself.

**[Get Your First AI Workflow →]**

---

## Quick Reference

| Term | Meaning |
|------|---------|
| **Model** | The AI brain file (2-50GB) |
| **Parameters** | Internal settings (billions of them) |
| **Quantization** | Compression for faster running |
| **Context window** | How much text AI can see at once |
| **Inference** | Getting a response from the model |
| **VRAM** | GPU memory (speeds up AI) |
| **GGUF** | Common model file format |

---

*© 2026 Howard / Rustwood. Built for operators who want control.*
