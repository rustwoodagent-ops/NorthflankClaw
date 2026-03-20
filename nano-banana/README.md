# Nano Banana helper

This lightweight helper scripts bridges the Google AI Studio (`generateContent`) endpoint with the Howard workspace. It reads the `GOOGLE_STUDIO_API_KEY` from your existing OpenClaw config (the `env` block in `~/.openclaw/openclaw.json`, the `.env` file, or the `GOOGLE_STUDIO_API_KEY` process environment variable) and sends whatever prompt you pass it.

## Usage

```bash
node nano-banana/nano-banana.mjs --prompt "Tell Nano Banana a little story"
```

Options:
- `--prompt`, `-p` — text prompt to send. If omitted, payload is read from STDIN.
- `--model` — target Gemini model (default: `gemini-flash-latest`).
- `--temperature` — sampling temperature (default: `0.72`).
- `--top-p` — nucleus sampling top-p (default: `0.95`).
- `--top-k` — top-k sampling (default: `40`).
- `--max-output-tokens` — how many tokens to let the model emit (default: `512`).
- `--json` — emit the raw Google response alongside the flattened answer.

The output is plain text and is safe to drop into a Telegram or WhatsApp reply. Use `--json` if you need the full metadata for debugging.

Nano Banana will throw a helpful error if the API key is missing or the request fails.
