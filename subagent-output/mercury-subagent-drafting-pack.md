# Mercury Content Drafting Support Pack
## Product: AI Workflow + ChatGPT Mastery Product Suite

---

## 1. REFINED OUTLINE: "Your First AI Workflow" (Beginner Edition)
**Target length:** 8-10 pages | **Skill level:** Complete beginner | **Time to complete:** One afternoon

---

### Page 1: Introduction — What's Possible in One Afternoon
- Hook: "You've seen AI automation demos. Today you build one."
- What you'll have by dinner: A working email summarizer that runs automatically
- No coding. No expensive tools. No prior experience.
- Time estimate: 2-4 hours | Cost: Under $1

### Page 2: What Is an AI Workflow? (The Simple Version)
- Definition: "A sequence where AI processes information and takes action"
- The conveyor belt analogy: Input → Processing → Output
- Real example: Spam filtering (you've already used AI workflows)
- The 5 components: Trigger, Input, AI Processing, Output, Action

### Page 3: Your Tool Stack (All Free)
- **n8n**: Visual workflow builder (free self-hosted)
- **OpenAI API**: The AI brain (pay-as-you-go, ~$0.01 per email)
- **Gmail**: Input and output channel (free)
- Setup time: 30 minutes total

### Page 4: Step-by-Step Setup (Part 1)
1. Create OpenAI account + API key
2. Set spending limit ($5 max)
3. Install n8n (Docker option shown)
4. Connect Gmail credentials

### Page 5: Step-by-Step Build (Part 2)
1. Create new workflow in n8n
2. Add Schedule Trigger (daily at 7 AM)
3. Add Gmail node (fetch unread emails)
4. Add OpenAI node (summarize prompt)
5. Add Gmail send node (deliver digest)
- Visual diagram showing node connections

### Page 6: The Prompt That Powers It
```
Summarize this email in 2-3 sentences. 
Identify if it requires a response.

From: {{ $json.From }}
Subject: {{ $json.Subject }}
Body: {{ $json.Text }}
```
- Explanation of each line
- How to customize for your needs

### Page 7: Testing & Troubleshooting
- Manual test walkthrough
- Common errors and fixes
- How to verify it's working
- Safety: Setting execution limits

### Page 8: What You've Built & Where Next
- Recap: You now have automated email summarization
- Skills acquired: workflow thinking, tool integration, AI prompting
- Extension ideas: Slack summaries, calendar digests, task creation
- Next product bridge: "Now you understand workflows. Ready to master ChatGPT itself?"

### Page 9-10: Quick Reference
- Node connection diagram (visual)
- Cost estimation table
- Prompt variations (3 options)
- Security checklist
- Resources for help

---

## 2. TITLE/SUBTITLE VARIANTS: $19 ChatGPT Mastery Product
**Product:** Repurposed from Professor Pro | **Price point:** $19 | **Target:** Knowledge workers using ChatGPT occasionally

---

### Variant 1 — Direct Benefit
**Title:** ChatGPT Mastery  
**Subtitle:** Get noticeably better results in 30 minutes — no technical skills required

### Variant 2 — Transformation Focus
**Title:** From Prompts to Productivity  
**Subtitle:** The practical guide to unlocking ChatGPT's real potential

### Variant 3 — Problem/Solution
**Title:** ChatGPT Unlocked  
**Subtitle:** Why your prompts get mediocre results (and how to fix them today)

### Variant 4 — Time-Bound Promise
**Title:** The 30-Minute ChatGPT Upgrade  
**Subtitle:** Practical techniques that work immediately — with the free version

### Variant 5 — Skill Building
**Title:** The ChatGPT Power User's Handbook  
**Subtitle:** Advanced techniques made simple for everyday tasks

### Variant 6 — Outcome Focused
**Title:** Better ChatGPT Results, Guaranteed  
**Subtitle:** The same-day system for clearer, faster, more useful AI outputs

### Variant 7 — Authority Angle
**Title:** ChatGPT Like a Pro  
**Subtitle:** Expert prompting techniques without the expert learning curve

### Variant 8 — Frustration Addressing
**Title:** Stop Wrestling With ChatGPT  
**Subtitle:** Get the outputs you actually want — every single time

### Variant 9 — Efficiency Play
**Title:** ChatGPT Mastery in Minutes  
**Subtitle:** Cut your prompt time in half while doubling output quality

### Variant 10 — Practical Results
**Title:** The ChatGPT Results Method  
**Subtitle:** Copy-paste templates and techniques that work with free ChatGPT

---

## 3. SHORTER MODULE STRUCTURE: $19 ChatGPT Product (50 Pages Max)
**Structure:** 5 modules | **Target:** 45-50 pages | **Reading time:** ~90 minutes

---

### MODULE 1: The Quick Win (Pages 1-8)
**Goal:** Reader gets first improvement in 10 minutes

1. Why most prompts fail (2 pages)
   - The "guess what I'm thinking" problem
   - One change that fixes 80% of bad outputs
   
2. The 4-part prompt structure (4 pages)
   - Context + Task + Format + Constraints
   - Before/after examples (3 transformations)
   - Try-this-now exercise

3. Your first high-quality prompt (2 pages)
   - Template library (5 essential prompts)
   - Customization guide

### MODULE 2: Core Techniques (Pages 9-22)
**Goal:** Master the fundamentals

1. Context setting (3 pages)
   - Background information that improves results
   - Examples: persona, situation, goal
   
2. Format specification (3 pages)
   - Output structures: bullet points, tables, JSON
   - When to use which format
   
3. Constraint setting (3 pages)
   - Length limits, tone adjustments, exclusions
   - Avoiding unwanted content
   
4. Role prompting (4 pages)
   - When personas help (and when they don't)
   - 10 effective role templates

### MODULE 3: Advanced Methods (Pages 23-35)
**Goal:** Handle complex tasks

1. Iterative refinement (4 pages)
   - The conversation loop technique
   - Building on previous outputs
   
2. Chain-of-thought prompting (4 pages)
   - Breaking complex problems into steps
   - Examples: analysis, planning, decision-making
   
3. Working with long documents (4 pages)
   - Chunking strategies
   - Summarization techniques

### MODULE 4: Real Applications (Pages 36-45)
**Goal:** Apply to actual work

1. Writing & content creation (3 pages)
   - Emails, posts, articles, copy
   
2. Research & analysis (3 pages)
   - Summarization, extraction, comparison
   
3. Problem-solving (3 pages)
   - Brainstorming, decision frameworks, troubleshooting

### MODULE 5: Your Personal System (Pages 46-50)
**Goal:** Sustain and improve

1. Building your prompt library (2 pages)
   - Organization, versioning, refinement
   
2. Troubleshooting guide (2 pages)
   - Common problems and fixes

---

## 4. LANDING PAGE BULLET VARIATIONS

---

### Product A: "Local AI in Plain English" (Free Guide)

#### Variation 1 — Curiosity Focus
**Headline:** Understand Local AI in 20 Minutes

**Bullets:**
- What "local AI" actually means (without the technical jargon)
- The privacy trade-off: what stays on your computer vs. what doesn't
- Why tokens matter — and how to estimate your usage
- Context windows explained: how much can your AI actually remember?
- Small vs. medium vs. large models: which one do you actually need?
- The 5 beginner mistakes that waste time and disk space
- Quick-start checklist: get your first local model running today

#### Variation 2 — Control/Privacy Focus
**Headline:** Run AI on Your Own Computer

**Bullets:**
- Keep your data private — nothing leaves your machine
- No subscription fees, no usage limits, no internet required
- Understand the real difference between cloud and local AI
- Learn what "tokens" and "context windows" mean in plain English
- Choose the right model size for your hardware (and avoid crashes)
- Avoid the 5 mistakes every beginner makes
- Get your first local AI running in under an hour

#### Variation 3 — Practical Focus
**Headline:** Local AI: The Practical Introduction

**Bullets:**
- Cut through the jargon: what local AI actually is and isn't
- Complete privacy comparison: local vs. cloud AI
- Token basics: understand costs and limits without the math
- Context windows made simple: how much text fits in AI memory
- Model selection guide: match the right AI to your computer
- Mistake prevention: what not to do on your first setup
- Step-by-step checklist from download to first conversation

---

### Product B: "Your First AI Workflow" (Free Guide)

#### Variation 1 — Achievement Focus
**Headline:** Build Your First AI Automation This Afternoon

**Bullets:**
- Go from zero to working automation in 2-4 hours
- Build a real email summarizer that runs automatically every morning
- No coding required — visual tools only
- Total cost under $1 using free tiers
- Learn the 5 components every AI workflow needs
- Get the exact prompt that powers professional automations
- Troubleshooting guide for when things don't work first time

#### Variation 2 — Simplicity Focus
**Headline:** Your First AI Workflow: A Beginner's Guide

**Bullets:**
- The simplest possible introduction to AI automation
- Build one working system: an email digest that runs daily
- Visual, step-by-step instructions anyone can follow
- Uses only free tools (n8n + OpenAI + Gmail)
- Understand triggers, processing, and actions without theory
- Copy-paste prompts ready to customize
- What to do when errors happen (inevitable, fixable)

#### Variation 3 — Outcome Focus
**Headline:** Automate Your Email Summaries (Your First AI Workflow)

**Bullets:**
- Wake up to an AI-generated email digest every morning
- Learn automation by building something you can actually use
- Complete beginner-friendly — no technical background needed
- Free tool stack: n8n, OpenAI API, Gmail
- Step-by-step setup: from accounts to first automation
- Master the core workflow components while you build
- Extend it: Slack summaries, task creation, and more

---

## DELIVERY CHECKLIST

- [x] Refined outline for "Your First AI Workflow" (8-10 pages, beginner-friendly)
- [x] 10 title/subtitle variants for $19 chatbox product
- [x] Shorter module structure for $19 product (5 modules, 50 pages max)
- [x] Landing page bullet variations for both free products

**Status:** Complete and ready for Howard review

**Next suggested actions:**
1. Select preferred title variant for $19 product
2. Review module structure for flow and completeness
3. Choose landing page bullet variant for each free product
4. Queue next drafting task (full Module 1 draft, landing page copy, or prompt template library)

---

*Drafted by Mercury (Content & Commerce Execution)*  
*Ready for Howard review and direction*
