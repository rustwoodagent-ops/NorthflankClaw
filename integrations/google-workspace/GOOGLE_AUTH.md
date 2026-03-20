# Google Auth Hardening Notes

## Canonical Google Workspace auth path
Use this integration as the single source of truth for Google Workspace APIs:

- `integrations/google-workspace/secrets/client.json`
- `integrations/google-workspace/secrets/token.json`

This path is for:
- Gmail
- Drive API
- Calendar
- Docs
- Sheets
- Slides

## Important separation
Do **not** confuse this with the separate Google Drive backup path used by `rclone`.

- Workspace/API auth lives here: `integrations/google-workspace/secrets/`
- Backup transport auth may also exist elsewhere for `rclone` and should be treated as a separate system.

These two auth systems can both be valid at the same time.

## Stability rules
1. Do not casually replace `client.json` once working.
2. Do not delete `token.json` unless intentionally re-authorising.
3. Keep both files owner-only (`chmod 600`).
4. Treat this client as the long-term Google auth anchor.
5. Rotate the OAuth client secret if it was shared in chat or any non-secret channel.

## Normal operations
Generate consent URL:

```bash
cd integrations/google-workspace
npm run auth:url
```

Exchange code for token:

```bash
npm run auth:token -- "<CODE_OR_REDIRECT_URL>"
```

Fast health-check (non-writing):

```bash
npm run health
```

Full verification (writes test Docs/Sheets/Slides):

```bash
npm run verify
```

## Recovery path
If auth breaks:
1. Confirm `client.json` and `token.json` still exist.
2. Run `npm run health`.
3. If health fails, regenerate consent URL with `npm run auth:url`.
4. Approve access and exchange the returned code.
5. Run `npm run verify` once after re-auth.

## Current known-good state
- OAuth client stored in `secrets/client.json`
- OAuth token stored in `secrets/token.json`
- File permissions locked to owner-only
- Full verification succeeded on 2026-03-12 for Gmail, Calendar, Drive, Docs, Sheets, Slides
