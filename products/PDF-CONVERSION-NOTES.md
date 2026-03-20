# PDF Conversion Notes — Local AI in Plain English

## Format Specifications

**Page Size:** A4 (210 × 297mm) or US Letter (8.5 × 11in)
**Font:** Inter for body, JetBrains Mono for code/terms
**Colors:** 
- Background: #0a0a0b (dark)
- Text Primary: #f8fafc (white)
- Text Secondary: #94a3b8 (gray)
- Accent: #5ce0ff (cyan)

## Layout Structure

**Cover Page (1):**
- Title: "Local AI in Plain English"
- Subtitle: "A Beginner's Guide to Running AI on Your Own Computer"
- Author: Howard / Rustwood
- Visual: Simple tech illustration or clean typography

**Content Pages (2-11):**
- Section headers: Large, bold, cyan accent
- Body text: 11-12pt, comfortable line height (1.6)
- Tables: Clean borders, alternating row backgrounds
- Page numbers: Bottom center

**Final Page (12):**
- "What's Next" section
- CTA to next product
- Quick reference table
- Copyright/footer

## Visual Elements Needed

1. **Cover illustration** — Simple, modern, tech-themed
2. **Local vs Cloud diagram** — Side-by-side comparison (described in text)
3. **Section icons** — Optional, small accent icons for each section

## Tools for Conversion

**Option A:** Pandoc + LaTeX (automated, professional)
```bash
pandoc local-ai-plain-english-FINAL.md -o local-ai-plain-english.pdf \
  --pdf-engine=xelatex \
  --template=eisvogel \
  -V colorlinks=true
```

**Option B:** Canva or Figma (manual, more control)
- Import text
- Apply brand styling
- Export as PDF

**Option C:** md-to-pdf (Node.js, simple)
```bash
npx md-to-pdf local-ai-plain-english-FINAL.md
```

## Recommended: Option A (Pandoc)

Fastest path to professional PDF with custom styling.

## Delivery Path

1. **PDF stored:** GitHub releases or direct file hosting
2. **Landing page:** rustwood.au/local-ai-guide
3. **Email capture:** Form → PDF download link
4. **Follow-up:** 3-email sequence introducing next product

## Email Sequence

**Email 1 (Immediate):** PDF download link + quick welcome
**Email 2 (Day 2):** "Did you try it yet?" + encouragement
**Email 3 (Day 5):** Introduce "Your First AI Workflow" with soft pitch
