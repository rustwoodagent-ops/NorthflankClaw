# OpenClaw Project Board
**Last updated:** 2026-03-08  
**Maintained by:** Howard (main)

---

## Board

| Item | Owner | Milestone 1 | M1 Due | Milestone 2 | M2 Due | Milestone 3 | M3 Due | Status | Key Risks | Dependencies |
|------|-------|-------------|--------|-------------|--------|-------------|--------|--------|-----------|--------------|
| GIDEON DNS/Auth | GIDEON (subagent) | Validation report review | 2026-03-08 | Auth flow fix + retest | 2026-03-10 | Runbook published | 2026-03-12 | 🟡 In progress | DNS propagation delay; credential exposure | DNS provider access; auth system inventory |
| ADA Blueprint | ADA (subagent) | Blueprint v0.1 review | 2026-03-08 | Implementation tickets drafted | 2026-03-10 | Migration plan finalized | 2026-03-14 | 🟢 v0.1 done | Architectural drift; missing requirements | Architecture review input; Aaron sign-off |
| ClawX Private Deploy | Deploy team | Dep verification on target host | 2026-03-10 | Install script run + validation | 2026-03-12 | Deployment playbook published | 2026-03-14 | 🟡 Package ready | Secrets exposure; env parity | libnspr4, libnss3, libasound2; repo access |
| Qwen3-TTS Swap | TTS team | CPU/GPU perf benchmark | 2026-03-12 | Local wrapper (ElevenLabs API compat) | 2026-03-16 | Caching + rollback plan | 2026-03-18 | 🟡 Audit done | SLA/cost mismatch; quota limits; CUDA deps | Target hardware inventory; API keys |
| Agent Authority Page | UI/Docs lead | Final 31 avatars uploaded | 2026-03-10 | Roster order confirmed + committed | 2026-03-11 | Published to GH Pages | 2026-03-12 | 🟡 Placeholders live | Avatar assets not finalized | Final PNGs or placeholder approval |
| 30-60-90 Plan | Howard (main) | Draft finalized with owners/dates | 2026-03-10 | Aaron sign-off | 2026-03-12 | Production rollout prep | 2026-03-14 | 🟡 Drafted | Visibility into cross-item deps | Strategic inputs from Aaron |

## Legend
- 🟢 Complete / on track
- 🟡 In progress / attention needed
- 🔴 Blocked
- ⚪ Not started

## Review Cadence
- **Daily:** Howard checks board, updates status, escalates blockers.
- **Weekly:** Summary to Aaron with risk/decision log updates.
