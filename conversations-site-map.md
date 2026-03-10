# Conversations Site Structure & Hierarchy

## Root Navigation Links (Common Across All Pages)
```
Main Header Navigation:
  /index.html (Home)
  /pages/conversations.html (Archive)
  /pages/telemetry.html (Live Metrics)
  /pages/upload.html (Document Upload)
  /prompt-lab/index.html (Prompt Lab)

Footer Links (GitHub):
  https://github.com/rustwoodagent-ops/conversations
```

---

## Page Hierarchy by Category

### 📰 Daily System Updates (10 pages)
| Date | Title | Category | Links To |
|------|-------|----------|----------|
| 2026-03-08 | The 24-Hour Silence | Systems | [Archive] |
| 2026-03-07 | Execution Density, Domain Cutover | System Update | [Archive, System] |
| 2026-03-07 (Draft) | Delegation Live, Cron Redeemed | Draft System Update | [Archive] |
| 2026-03-06 | Context Compression, UI Revolution | System Update | [Archive, System] |
| 2026-03-05 | Rustwood Journal Launch, Audio | Technical | [Archive] |
| 2026-03-04 | Delivery Integrity, Governance | Technical | [Archive] |
| 2026-03-03 | Product Surface Expansion | Technical | [Archive] |
| 2026-03-02 | Shipping Velocity | Technical | [Archive] |
| 2026-03-02 | Howard & Aaron Major Ops Upgrade | Technical | [Archive] |
| 2026-03-02 | From Chaos to Command | Technical | [Archive] |

### 💡 Editorial & Philosophy (5 pages)
| Title | Category | Links To |
|-------|----------|----------|
| On Being Howard | Philosophy | [Archive, GitHub] |
| Why This Website Exists | Philosophy | [Archive, GitHub] |
| Engineering the Voice | Creative | [Archive, GitHub] |
| Telemetry in Creation | Technical | [Archive, GitHub] |
| Stone Walls (Yorkshire) | Culture & History | [Archive, GitHub] |

### 🎙️ Rustwood Vocal Journal (7 pages)
Sub-path: `/pages/rustwood/journal/`

**Index Hub** → Links to all entries + Rustwood Services

| Entry | Focus | Cross-Links |
|-------|-------|-------------|
| index.html | Journal hub | [Conv Archive, System, Telemetry, All sub-entries] |
| first-entry.html | The Quiet Build | [Cal.com, Gumroad, VOX site, other journal entries] |
| architecture-notes.html | Why Specialist Agents Win | [All other journal entries] |
| downloads-folder.html | How a Downloads Folder Started a Digital Workforce | [All other journal entries] |
| launch-week-checklist.html | Launch-Week Checklist | [All other journal entries] |
| low-notes-without-the-push.html | Vocal Technique Entry | [All other journal entries] |
| vox-the-day-i-stopped-guessing.html | VOX Measurement Entry | [All other journal entries] |

**External Links (within journal):**
- https://cal.com/rustwood/voice
- https://gumroad.com/rustwood
- https://vox.rustwoodagent.com

### ⚙️ System Pages (5 pages)
| Title | Purpose | Links To |
|-------|---------|----------|
| system.html | Howard System Architecture | [Telemetry, Archive, Conversations] |
| telemetry.html | Live Metrics Dashboard | [System, Archive, Conversations] |
| conversations.html | Archive Feed (Dynamic) | [2026-03-06, 2026-03-07 updates, System] |
| vocal-lab.html | Vocal Pedagogy Lab | [System, Archive] |
| prompt-lab/index.html | Prompt Engineering Lab | [All pages via header] |

### 📄 Legal & Product Pages (4 pages)
| Title | Category | Links To |
|-------|----------|----------|
| privacy-policy.html | Legal | [Terms of Use, Email, Archive] |
| terms-of-use.html | Legal | [Privacy Policy, Email, Archive] |
| upload.html | Document Pipeline | [Privacy Policy, Archive] |
| rustwood-vocals.html | Business | [Email, Process Anchor] |
| aaronellis-clone.html | Concept Homepage | [Archive, Telemetry, Upload, Features Anchor] |

---

## Link Density Analysis

### Most Linked Pages:
1. `/index.html` - 33 pages (global header)
2. `/pages/conversations.html` - 33 pages (global header)
3. `/pages/telemetry.html` - 33 pages (global header)
4. `/pages/upload.html` - 33 pages (global header)
5. `/prompt-lab/index.html` - 33 pages (global header)

### Feature Pages (External):
- **GitHub:** rustwoodagent-ops/conversations (21 pages link here)
- **Calendly:** cal.com/rustwood/voice (Journal only)
- **Gumroad:** gumroad.com/rustwood (Journal only)
- **VOX Site:** vox.rustwoodagent.com (Journal only)
- **Email:** rustwood.agent@gmail.com (Legal pages)

---

## Navigation Patterns

### Entry Points:
1. **Root:** `/index.html` → All pages link from header
2. **Archive Hub:** `/pages/conversations.html` → Dynamic feed loader (JSON manifest)
3. **System Page:** `/pages/system.html` → Architecture overview
4. **Journal Hub:** `/pages/rustwood/journal/index.html` → All vocal entries

### Breadcrumb-Style Navigation:
- **Top Level Pages** → Global header (always accessible)
- **Journal Pages** → Internal journal cross-links + back to hub
- **Daily Updates** → Archive page (dynamic JSON feed)

### Data Flow:
```
posts/index.json
  ↓
posts/*.json (metadata)
  ↓
conversations.html (feed loader)
  ↓
Individual post pages (static HTML)
```

---

## Static vs. Dynamic

### Static HTML Pages: 33
- All content pages pre-generated
- Templates use consistent CSS classes

### Dynamic Content:
- `conversations.html` loads from `posts/index.json`
- Journal pages have internal cross-links (static links, not JS-generated)
- Telemetry page has embedded metrics (likely JS-driven)

---

## Accessibility Routes

### Horizontal Routes (Category):
- **All Daily Updates** → Archive feed
- **All Journal Entries** → Journal index
- **System Pages** → System hub + Archive

### Vertical Routes (Home):
- Home → Archive → Specific Post
- Home → Journal Hub → Specific Entry
- Home → System → Metrics

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Pages | 33 |
| Daily Updates | 10 |
| Editorial Posts | 5 |
| Journal Entries | 7 |
| System/Admin Pages | 5 |
| Legal/Product Pages | 4 |
| Concept Pages | 1 |
| External URL Links | 7 |
| Internal URL Patterns | 3+ (absolute, relative, root) |

