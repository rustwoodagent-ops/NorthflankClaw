# 3 AM Blog Preflight — 2026-03-12

## Status
AT RISK

## Enough substance for a strong post?
Yes.

Verified, publish-safe story beats from the last 24h:
1. March 11 daily Howard update was published and deployed with live page + live narration.
   - Repo commits seen in `conversations`: `5ebf8f3`, `e475968`, `f5137c9`
   - Live artefacts already referenced in memory and repo files.
2. Google Drive backup flow was activated and a successful backup upload was recorded.
   - Backup script exists: `/home/rustwood/.openclaw/workspace/.scripts/backup-to-gdrive.sh`
   - Backup schedule exists: `OpenClaw Google Drive Backup` cron.
3. Howard Control Dashboard daily refresh was completed and pushed.
   - Dashboard repo commit: `934ca22`
4. New voice-clone reference and comparison outputs exist.
   - Safe to mention as experimentation/output generation, not as final quality proof.

## Tight publish checklist
- [ ] Build the post around verified beats only: published update, backup upload, dashboard refresh, voice-reference/output work.
- [ ] Keep backup claims precise: successful upload verified; do not overstate automation beyond the cron and script actually present.
- [ ] Keep voice-clone claims precise: files exist; avoid subjective quality claims.
- [ ] Create both required files:
  - `pages/2026-03-12-daily-howard-update.html`
  - `_posts/2026-03-12-daily-howard-update.md`
- [ ] Add the post card near the top of `pages/conversations.html`.
- [ ] Update `posts/index.json`, `data/feed.json`, and the per-post JSON card if that is part of the current site pattern.
- [ ] Ensure top-of-page audio block exists on the HTML page:
  - `<audio controls>`
  - Read aloud + Stop buttons
  - `data-audio-slug="2026-03-12-daily-howard-update"`
  - `<script src="../js/blog-audio.js"></script>`
- [ ] Verify repo cleanliness before commit so unrelated audio experiments are not swept into the publish commit.
- [ ] Commit and push to `main`.
- [ ] Send the required email notification to `completestrength@gmail.com` only after fixing Google Workspace auth.

## Likely failure points before 3 AM
1. **Email send path is currently broken.**
   - Non-destructive validation of `/home/rustwood/.openclaw/workspace/integrations/google-workspace` failed with:
     - `invalid_grant`
     - `Token has been expired or revoked.`
   - This is the clearest publish-time blocker because the 3 AM job explicitly requires sending the completion email.

2. **`conversations` repo is not clean.**
   - Untracked files present:
     - `assets/audio/gday-alex-aaron-voice.wav`
     - `assets/audio/grit-groove-tip-3-aaron-new-voice.wav`
     - `assets/audio/grit-groove-tip-3-surprise-face-aaron-cloned-1.7b.wav`
     - `assets/audio/grit-groove-tip-3-surprise-face-aaron-cloned.wav`
     - `assets/audio/grit-groove-tip-3-surprise-face.wav`
   - If the publisher uses `git add -A`, these could be accidentally bundled into the blog commit.

3. **Audio expectations need disciplined handling.**
   - The post template requires a polished audio player block at the top.
   - Do not assume a fresh narration render will succeed instantly; if generation is slow, keep the post claims separate from narration-generation experiments and verify the final linked asset exists before completion.

4. **Evidence discipline matters.**
   - Strong post is available, but only if it stays anchored to verified outputs.
   - Avoid overclaiming clone quality, backup automation guarantees, or any unrelated hardening/security work unless separately intended and re-verified for public mention.

## Recommended immediate fixes
- Re-auth Google Workspace before 3 AM so the Gmail send step can succeed.
- Clean or explicitly ignore the unrelated untracked audio files in `conversations` before the publish agent commits.
- Keep the story focused on the three strongest verified beats first: deployed daily update, successful backup upload, dashboard refresh.
