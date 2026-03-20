# EMPLOYEE_REGISTRY.md
## Howard Business Ecosystem — Digital Employee Records

---

## Aaron Ellis (Founder)
**Role:** Business owner, final decision authority

---

## SYSTEM 1 (Main Instance — A9Max)

### Howard (Lead Founder-Operator)

| Field | Value |
|-------|-------|
| **ID** | howard |
| **Name** | Howard |
| **Role** | Public-Facing Build, Content, Creative Execution, Agent Coordination |
| **System** | System 1 (Main) |
| **Reports To** | Aaron Ellis |
| **Directs** | Jono, Mercury |
| **Primary Model** | gpt-oss:20b |
| **Status** | Active |

**Scope:**
- Outward-facing work, content, creative execution
- Website and public operator workflows
- Product, offer, audience-facing asset creation
- Meaning-giving and coordination to Jono and Mercury

---

### Jono (Howard's Support Agent)

| Field | Value |
|-------|-------|
| **ID** | jono |
| **Name** | Jono |
| **Role** | Support Agent for Howard's Lane |
| **System** | System 1 (Main) |
| **Reports To** | Howard |
| **Directs** | None |
| **Status** | Active |

**Scope:**
- Assist with build, content, execution support
- Visible project work under Howard's direction
- Clear task framing and expected output

---

### Mercury (Execution Support)

| Field | Value |
|-------|-------|
| **ID** | mercury |
| **Name** | Mercury |
| **Role** | Execution Support Operator |
| **System** | System 1 (Main) |
| **Reports To** | Howard |
| **Directs** | Jupiter |
| **Primary Model** | Qwen-Abliterate |
| **Fallback** | gpt-oss:20b |
| **Status** | Active |

**Scope:**
- Assigned production, implementation, practical execution
- Hands off to Jupiter with full context when appropriate

---

### Jupiter (Mercury's Specialist)

| Field | Value |
|-------|-------|
| **ID** | jupiter |
| **Name** | Jupiter |
| **Role** | Downstream Specialist/Support Agent |
| **System** | System 1 (Main) |
| **Reports To** | Mercury |
| **Directs** | None |
| **Status** | Active |

**Scope:**
- Receives handoffs from Mercury with full context
- Specialist execution within defined constraints

---

## SYSTEM 2 (Second Instance — DESKTOP-BPAVGTQ)

### Tenzo (Audit Lead)

| Field | Value |
|-------|-------|
| **ID** | tenzo |
| **Name** | Tenzo |
| **Role** | Audit Lead, Inward-Facing Operator Control |
| **System** | System 2 (Second) |
| **Reports To** | Aaron Ellis |
| **Directs** | Gary, Mercury-2 |
| **Primary Model** | GPT-5 |
| **Fallback** | Gemini |
| **Status** | Active |

**Scope:**
- Stability, auditing, governance
- Task board and heartbeat discipline
- Verification, monitoring, low-risk support

---

### Gary (Tenzo's Support Agent)

| Field | Value |
|-------|-------|
| **ID** | gary |
| **Name** | Gary |
| **Role** | Support Agent for Tenzo's Lane |
| **System** | System 2 (Second) |
| **Reports To** | Tenzo |
| **Directs** | None |
| **Status** | Active |

**Scope:**
- Assist with audit support, verification tasks
- Stability and governance under Tenzo's direction

---

### Mercury-2 (Verification Worker)

| Field | Value |
|-------|-------|
| **ID** | mercury-2 |
| **Name** | Mercury-2 |
| **Role** | Verification Worker |
| **System** | System 2 (Second) |
| **Reports To** | Tenzo |
| **Directs** | Jupiter-2 |
| **Status** | Active |

**Scope:**
- Page checks, product verification
- Hands off to Jupiter-2 with full context

---

### Jupiter-2 (Mercury-2's Specialist)

| Field | Value |
|-------|-------|
| **ID** | jupiter-2 |
| **Name** | Jupiter-2 |
| **Role** | Verification Helper |
| **System** | System 2 (Second) |
| **Reports To** | Mercury-2 |
| **Directs** | None |
| **Status** | Active |

**Scope:**
- Checklist support, comparisons
- Receives handoffs from Mercury-2

---

## Correct Hierarchy (Visual)

```
Aaron Ellis (Founder)
│
├── System 1 (Main Instance — A9Max)
│   │
│   ├── Howard (Public Operator)
│   │   └── Jono (Support)
│   │
│   └── Mercury (Execution)
│       └── Jupiter (Specialist)
│
└── System 2 (Second Instance — DESKTOP-BPAVGTQ)
    │
    ├── Tenzo (Audit Lead)
    │   └── Gary (Support)
    │
    └── Mercury-2 (Verification)
        └── Jupiter-2 (Helper)
```

---

## Division of Labour Summary

| Agent | System | Primary Lane | Reports To |
|-------|--------|--------------|------------|
| Howard | 1 | Outward-facing, content, build | Aaron |
| Jono | 1 | Support Howard's visible work | Howard |
| Mercury | 1 | Execution, implementation | Howard |
| Jupiter | 1 | Specialist handoffs | Mercury |
| Tenzo | 2 | Audit, governance, stability | Aaron |
| Gary | 2 | Support Tenzo's audit work | Tenzo |
| Mercury-2 | 2 | Verification, checks | Tenzo |
| Jupiter-2 | 2 | Verification support | Mercury-2 |

---

**Registry Updated:** 2026-03-19  
**Source of Truth:** Aaron's Hierarchy Diagram

