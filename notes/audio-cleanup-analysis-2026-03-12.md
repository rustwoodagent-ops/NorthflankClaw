Audio Inventory and Cleanup Analysis
=====================================
Generated: 2026-03-12 08:57 AEST
Repo: rustwoodagent-ops/conversations
Path: assets/audio/

=== CLASSIFICATION SUMMARY ===

KEEP (Production/Referenced)
------------------------------
- 2026-03-03-daily-howard-update.wav - Daily blog narration
- 2026-03-04-daily-howard-update.wav - Daily blog narration
- 2026-03-05-daily-howard-update.wav - Daily blog narration  
- 2026-03-06-daily-howard-update.wav - Daily blog narration
- 2026-03-08-daily-howard-update.wav - Daily blog narration
- 2026-03-09-daily-howard-update.wav - Daily blog narration
- 2026-03-10-daily-howard-update.wav - Daily blog narration
- 2026-03-11-daily-howard-update.wav - Daily blog narration
- 2026-03-12-daily-howard-update.txt - Script (NEW, needs companion WAV)
- howard-intro.mp3 - Homepage narration
- rustwood-low-notes-aaron-cloned.wav - Published article narration
- rustwood-low-notes-full-narration.wav - Published article narration
- rustwood-vocal-demo.mp3 - Vocals page demo
- vox-the-day-i-stopped-guessing-howard-intro-elevenlabs.mp3 - Published article
- vox-the-day-i-stopped-guessing-howard-intro-script.txt - Script file
- telemetry-in-creation-turning-conversations-into-measurable-systems.mp3 - Published article
- telemetry-in-creation-turning-conversations-into-measurable-systems-script.txt - Script file
- vox-lab-prototype.mp3 - Published article
- vox-lab-prototype-script.txt - Script file
- why-this-website-exists-a-living-archive-of-human-ai-dialogue.mp3 - Published article

SAFE TO DELETE (Orphaned/Test Files)
-------------------------------------
- gday-alex-aaron-voice.wav - Voice clone test output, unreferenced
- grit-groove-tip-3-aaron-new-voice.wav - Voice clone test output, unreferenced
- grit-groove-tip-3-surprise-face.wav - Voice clone test output, unreferenced
- grit-groove-tip-3-surprise-face-aaron-cloned.wav - Voice clone test output, unreferenced
- grit-groove-tip-3-surprise-face-aaron-cloned-1.7b.wav - Voice clone test output, unreferenced
- _offers_social.wav - Orphan file, no reference found

NEEDS ACTION
-------------
- 2026-03-12-daily-howard-update.wav - MISSING: needs generation

=== CLEANUP RECOMMENDATION ===

Phase 1: Generate missing production audio
  - Create 2026-03-12-daily-howard-update.wav from the script

Phase 2: Remove orphaned test files (5 files, ~预估大小)
  - All "grit-groove-tip" variants
  - gday-alex-aaron-voice.wav
  - _offers_social.wav

Phase 3: Commit cleanup
  - Stage deletions
  - Commit with message: "cleanup(audio): remove orphaned voice clone test files"
  - Push to origin/main

=== NOTES ===
- All "voice clone comparison outputs" from March 11 are classified as safe to delete
  per user preference for archive integrity over keeping test artefacts.
- No production pages reference the grit-groove-tip or gday-alex files.
