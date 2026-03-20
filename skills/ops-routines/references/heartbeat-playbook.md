# Heartbeat Playbook

## Heartbeat vs cron
- Use **heartbeat** for: grouped checks, context-aware follow-up, flexible timing.
- Use **cron** for: exact schedules, one-shot reminders, isolated execution.

## Suggested heartbeat checks (2–4/day)
- Email urgency
- Calendar events (next 24–48h)
- Mentions/notifications
- Weather relevance

## Notify when
- Important/urgent item appears
- Event is <2h away
- Meaningful new information exists
- >8h since last useful update

## Stay quiet when
- 23:00–08:00 unless urgent
- Nothing changed
- Last check was very recent
- User appears busy

## Tracking
Store check timestamps in `memory/heartbeat-state.json`.
