# Google Workspace Integration Setup

This folder wires one OAuth client for:
- Gmail
- Calendar
- Drive
- Docs
- Sheets
- Slides

## Files

- `secrets/client.json` — OAuth client (installed app)
- `secrets/token.json` — OAuth token (generated after consent)
- `scopes.json` — requested scopes
- `scripts/auth-url.js` — generate consent URL
- `scripts/exchange-code.js` — exchange auth code for token
- `scripts/verify-access.js` — verify all APIs

## Run

```bash
cd integrations/google-workspace
npm install
npm run auth:url
```

Open the printed URL, approve access, then copy either:
- full redirect URL (`http://localhost/?code=...`), or
- just the `code`.

Then:

```bash
npm run auth:token -- "<PASTE_CODE_OR_URL>"
npm run verify
```

## Single command runner

Use one entrypoint for day-to-day tasks:

```bash
npm run run-google-task -- inbox
npm run run-google-task -- send --to "you@example.com" --subject "Test" --body "Hello from Howard"
npm run run-google-task -- calendars
npm run run-google-task -- events --calendar primary --max 10
npm run run-google-task -- drive-list --max 10
npm run run-google-task -- new-doc --title "Meeting Notes"
npm run run-google-task -- new-sheet --title "Ops Tracker"
npm run run-google-task -- new-slides --title "Launch Deck"
```

Run help:

```bash
npm run run-google-task -- --help
```

## Security

- `secrets/` is gitignored.
- File permissions are locked to owner (`600`) for client + token files.
- Rotate client secret if it was ever shared outside trusted channels.
