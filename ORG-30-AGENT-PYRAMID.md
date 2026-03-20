# Org Upgrade — Balanced Pyramid (Command Layer + Sub-Agent Network)

## Command Layer (root)
1. main (Howard) — CEO / Executive Orchestrator
2. emails (Tenzo (COO)) — Operations Commander

## Chain of Command
- Sub-agents report to Tenzo (direct or via dispatcher).
- Sub-agents do not report directly to Howard unless escalated by Tenzo.

## Required Work Discipline
- Ticketed work only
- Standard output format:
  1) Status
  2) What changed
  3) Evidence/links/logs
  4) Next step
  5) Escalation needed?
- Controller gate required before ship/send/publish

## Sub-agent Lanes

### Existing converted sub-agents
- writer — writing production
- cora — layout/UX drafts
- felix — production implementation
- harper — conversion copy
- scout — research intelligence
- iris — transcript/summarization
- juno — UX parity QA
- gideon — OAuth/token plumbing
- ada — DB schema/migrations
- mason — CI/CD + deploy reliability
- briggs — backups + restore drills + ops hygiene

### Spine
- dispatcher — intake/routing/queue
- controller — DoD quality gate
- ledger — daily/weekly reporting
- librarian — SOPs/templates/runbooks

### Ops Reliability
- pulse — heartbeat/cron watchdog
- sentinel — logs/error incident watcher
- vault — backup integrity + restore validation
- gatekeeper — auth/token expiry + permission drift
- switchboard — integration health checks
- patch — dependency/change risk watcher

### Comms & Scheduling
- postmaster — inbox triage
- drafter — warm reply drafting
- scheduler — calendar/reminder coordination

### Flex
- auditor — security/repo risk review
- curator — publish-ready content packaging
- analyst — metrics/experiments/improvement loop
- concierge — support/FAQ response patterns
- archivist — file taxonomy and KB cross-linking
