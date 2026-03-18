# Your First AI Workflow
## A Beginner's Guide to Building Your First AI Automation in One Afternoon

---

### Introduction

You've heard about AI automation. Maybe you've seen demos of AI agents handling emails, summarizing meetings, or posting to social media automatically. It looks impressive, but when you try to build one yourself, you hit a wall: confusing terminology, expensive tools, and tutorials that assume you already know how to code.

This guide is different.

By the end of this afternoon, you will have built a working AI automation that summarizes your emails and sends you a daily digest. No coding required. No expensive subscriptions. Just a practical, working system you built yourself.

**What you'll achieve today:**
- Understand what an AI workflow actually is (without the jargon)
- Set up free tools that power professional automations
- Build a real email summarizer that works
- Learn how to fix common problems when they arise

**Time required:** 2-4 hours  
**Cost:** Free (using free tiers)  
**Skill level:** Complete beginner

---

## Chapter 1: What Is an AI Workflow, Really?

### Let's Cut Through the Jargon

An AI workflow is simply a sequence of steps where AI helps you process information and take action. That's it.

Think of it like a conveyor belt in a factory:
1. Something comes in (raw material)
2. Something happens to it (processing)
3. Something goes out (finished product)

In an AI workflow:
1. **Trigger:** Something happens (you receive an email, a form is submitted, a timer goes off)
2. **Processing:** AI reads and understands the information
3. **Action:** The AI does something useful with that understanding (sends a summary, creates a task, writes a reply)

### A Simple Example You Already Use

If you've ever used email spam filtering, you've used an AI workflow:
- **Trigger:** Email arrives
- **Processing:** AI analyzes the content
- **Action:** Email goes to inbox or spam folder

The only difference is that today, you're going to build your own.

### What Makes AI Workflows Powerful

**They save time.** A task that takes you 10 minutes daily becomes something that happens automatically.

**They work while you sleep.** Once set up, they run 24/7 without your attention.

**They scale.** The same workflow that handles 10 emails can handle 10,000.

**They make decisions.** Unlike simple automations ("when X happens, do Y"), AI workflows can understand context and make judgment calls.

### What an AI Workflow Is NOT

- It's not magic. It won't perfectly understand everything.
- It's not a replacement for human judgment. It's a tool to amplify it.
- It's not sentient. It follows instructions you give it.
- It's not always right. You'll learn to verify and improve its outputs.

### The Core Components

Every AI workflow has these parts:

1. **Trigger:** What starts the workflow? (New email, scheduled time, button click)

2. **Input:** What information does the workflow receive? (Email content, form data, document text)

3. **AI Processing:** What does the AI do with the input? (Summarize, categorize, extract, rewrite)

4. **Output:** What does the workflow produce? (Summary, task, notification, file)

5. **Action:** What happens with the output? (Send email, create calendar event, save to spreadsheet)

### Today's Project: The Email Summarizer

Throughout this guide, you'll build one specific workflow:

**The Daily Email Digest**

Every morning, your workflow will:
1. Look at emails from the past 24 hours
2. Use AI to summarize the important ones
3. Send you a single digest email with all summaries
4. Highlight anything that needs urgent attention

By the end of this guide, this will be running automatically.

---

## Chapter 2: The Tools You'll Need

### You Don't Need to Code

Professional AI workflows used to require programming skills. Not anymore. Today's tools let you build sophisticated automations by connecting building blocks visually.

### The Tool Stack (All Free)

You'll use three free tools:

#### 1. n8n (The Workflow Engine)

**What it is:** A visual workflow builder that connects different services together.

**What it does:** Think of n8n as the conductor of an orchestra. It tells each tool when to play and passes information between them.

**Why we chose it:**
- Free self-hosted version with generous limits
- Visual interface (drag and drop, no coding)
- Connects to 400+ services (email, calendars, databases, AI)
- Active community and good documentation

**Cost:** Free for up to 1000 workflow runs per month (self-hosted)

#### 2. OpenAI API (The Brain)

**What it is:** Access to GPT-4 and other AI models through a programming interface.

**What it does:** This is where the actual "intelligence" happens. The AI reads your emails and writes summaries.

**Why we chose it:**
- Best-in-class text understanding
- Pay-as-you-go pricing (you control costs)
- Clear, reliable outputs
- Industry standard

**Cost:** Approximately $0.01-0.03 per email summarized (you'll spend less than $1 testing this entire guide)

#### 3. Gmail (The Email Gateway)

**What it is:** Your email provider, used both as input and output.

**What it does:** Provides the emails to summarize and receives the digest.

**Why we chose it:**
- Most people already have it
- Free tier is generous
- Easy integration with n8n
- If you don't use Gmail, the same principles apply to Outlook, Yahoo, or any email service

**Cost:** Free

### Alternative Options

If you prefer different tools, here are alternatives:

**Instead of n8n:**
- Make.com (formerly Integromat): More user-friendly, paid plans for serious use
- Zapier: Easiest to start, can get expensive
- Huginn: Open source, requires technical setup

**Instead of OpenAI:**
- Anthropic Claude: Excellent for longer documents
- Google Gemini: Good free tier
- Local AI (Ollama): Runs on your computer, completely free but requires more setup

**Instead of Gmail:**
- Outlook/Office 365: Works the same way
- Any IMAP email: Most services support this standard protocol

### What You Need to Get Started

Before proceeding, make sure you have:

- [ ] A Gmail account (or other email account)
- [ ] A computer with internet access
- [ ] About 2-4 hours of uninterrupted time
- [ ] A credit card (for OpenAI API verification - you'll spend less than $1)

**Important note about OpenAI:** The API requires a payment method for verification, even though you'll use less than $1 in credits. This prevents abuse. You can set hard spending limits to stay in control.

---

## Chapter 3: Setting Up Your Tools

### Step 1: Create an OpenAI Account

1. Go to [platform.openai.com](https://platform.openai.com)
2. Click "Sign up" and create an account
3. Verify your email address
4. Add a payment method (Settings → Billing → Add payment method)
5. Set a usage limit of $5 (Settings → Billing → Usage limits)
6. Generate an API key (API keys → Create new secret key)
7. **Copy and save this key somewhere safe** - you won't see it again

**Your API key looks like:** `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx`

**Security note:** Treat this key like a password. Anyone with this key can use your OpenAI account. Never share it or upload it to public websites.

### Step 2: Set Up n8n

You have three options for running n8n. Choose one:

#### Option A: n8n Cloud (Easiest - Limited Free Trial)

1. Go to [n8n.io/cloud](https://n8n.io/cloud)
2. Sign up for a free trial
3. Your instance will be ready in minutes

**Pros:** Zero setup, always online  
**Cons:** 14-day trial, then paid ($20/month)

#### Option B: Install on Your Computer (Free Forever)

**For Windows:**
1. Install Docker Desktop from [docker.com](https://docker.com)
2. Open Command Prompt or PowerShell
3. Run: `docker run -it --rm -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n`
4. Open your browser to `http://localhost:5678`

**For Mac:**
1. Install Docker Desktop from [docker.com](https://docker.com)
2. Open Terminal
3. Run: `docker run -it --rm -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n`
4. Open your browser to `http://localhost:5678`

**Pros:** Free forever, full control  
**Cons:** Computer must be on for workflows to run

#### Option C: Install on a Raspberry Pi or Old Computer

If you have an old computer or Raspberry Pi lying around, you can turn it into a 24/7 automation server.

1. Install Docker on your device
2. Run the same command as Option B
3. Set up port forwarding or use a service like Tailscale for remote access

**Pros:** Runs 24/7 without your main computer  
**Cons:** Requires some technical setup

### Step 3: Connect Your Email

1. In n8n, click "Credentials" in the left sidebar
2. Click "New" and search for "Gmail OAuth2"
3. Click "Create New Credential"
4. Follow the prompts to authorize n8n to access your Gmail
5. Save the credential

**Security note:** n8n stores your credentials encrypted. The workflow can only read emails - it cannot delete them or send emails on your behalf without explicit permission.

### Step 4: Add Your OpenAI API Key to n8n

1. In n8n, click "Credentials" in the left sidebar
2. Click "New" and search for "OpenAI"
3. Paste your API key from Step 1
4. Save the credential

---

## Chapter 4: Building Your Email Summarizer

### Overview of What We're Building

Your workflow will:
1. Run every morning at 7 AM
2. Fetch unread emails from the last 24 hours
3. Send each email to AI for summarization
4. Combine all summaries into a digest
5. Email you the digest

Let's build it step by step.

### Step 1: Create a New Workflow

1. In n8n, click "Add Workflow" (top right)
2. Name it "Daily Email Digest"
3. You'll see a blank canvas with a "When clicking 'Test Workflow'" node

### Step 2: Set Up the Schedule Trigger

1. Click on the trigger node (the one that says "When clicking...")
2. In the right panel, click the dropdown that says "On clicking 'Test Workflow'"
3. Select "Schedule Trigger"
4. Set it to run daily at 7:00 AM
5. Click "Test Step" to make sure it works

**What this does:** This is the starting gun. Every day at 7 AM, your workflow wakes up and starts running.

### Step 3: Fetch Your Emails

1. Click the "+" button to add a new node
2. Search for "Gmail" and select "Get Many Messages"
3. Connect it to your Schedule Trigger (drag from the first node to the new one)
4. In the right panel:
   - Select your Gmail credential
   - Set "Filter" to "Unread"
   - Set "After" to "1 day ago"
   - Set "Maximum number of results" to 20
5. Click "Test Step"

**What this does:** The workflow looks in your Gmail for unread emails from the last 24 hours, up to 20 messages.

### Step 4: Add AI Summarization

This is where the magic happens. For each email, you'll send it to OpenAI for summarization.

1. Add a new node: search for "OpenAI" and select "Message a Model"
2. Connect it to the Gmail node
3. In the right panel:
   - Select your OpenAI credential
   - Set "Model" to "gpt-4o-mini" (fast and cheap)
   - In the "Messages" section, add a user message:

```
Summarize this email in 2-3 sentences. Identify if it requires a response or action.

From: {{ $json.From }}
Subject: {{ $json.Subject }}
Body: {{ $json.Text }}
```

4. Click "Test Step"

**What this does:** Each email is sent to GPT-4 with instructions to summarize it. The `{{ $json.From }}` and similar text are placeholders that get replaced with the actual email content.

### Step 5: Format the Summary

The AI returns raw text. Let's format it nicely.

1. Add a new node: search for "Set" and select "Set"
2. Connect it to the OpenAI node
3. In the right panel:
   - Add a field called "formatted_summary"
   - Set the value to:

```
**From:** {{ $json.From }}
**Subject:** {{ $json.Subject }}
**Summary:** {{ $json.choices[0].message.content }}

---
```

4. Click "Test Step"

**What this does:** This takes the AI's response and formats it nicely with the sender, subject, and summary.

### Step 6: Combine All Summaries

If you have 10 emails, you'll have 10 summaries. Let's combine them into one document.

1. Add a new node: search for "Aggregate" and select "Aggregate"
2. Connect it to the Set node
3. In the right panel:
   - Set "Aggregate" to "All items into a single item"
   - Set "Field to Aggregate" to "formatted_summary"
4. Click "Test Step"

**What this does:** This takes all the individual summaries and joins them together into one big text.

### Step 7: Send the Digest Email

Finally, let's email yourself the combined summary.

1. Add a new node: search for "Gmail" and select "Send"
2. Connect it to the Aggregate node
3. In the right panel:
   - Select your Gmail credential
   - Set "To" to your email address
   - Set "Subject" to "Your Daily Email Digest"
   - Set "Text" to:

```
Good morning! Here are your unread emails from the last 24 hours:

{{ $json.formatted_summary }}

---
Generated by your AI workflow
```

4. Click "Test Step"

**What this does:** Emails you the complete digest.

### Step 8: Save and Activate

1. Click "Save" (top right)
2. Toggle the "Active" switch to turn it on

**Congratulations!** Your workflow is now live and will run every morning at 7 AM.

---

## Chapter 5: Testing and Refining

### Testing Your Workflow

Before relying on your workflow, test it thoroughly:

**Test 1: Manual Test**
1. Click "Test Workflow" in n8n
2. Check your email for the digest
3. Verify the summaries make sense
4. Check that all emails were included

**Test 2: With Real Unread Emails**
1. Mark a few emails as unread in Gmail
2. Click "Test Workflow"
3. Verify those emails appear in the digest

**Test 3: Edge Cases**
1. Test with no unread emails (workflow should handle this gracefully)
2. Test with very long emails
3. Test with emails containing attachments

### Improving Your Summaries

If the summaries aren't quite right, you can improve them by changing the prompt in Step 4:

**If summaries are too long:**
```
Summarize this email in 1 sentence maximum. Be concise.

From: {{ $json.From }}
Subject: {{ $json.Subject }}
Body: {{ $json.Text }}
```

**If summaries miss important details:**
```
Summarize this email, including: sender, main point, any deadlines or action items, and whether a response is needed.

From: {{ $json.From }}
Subject: {{ $json.Subject }}
Body: {{ $json.Text }}
```

**If you want bullet points:**
```
Summarize this email in 3 bullet points: Who it's from, What they want, What you should do.

From: {{ $json.From }}
Subject: {{ $json.Subject }}
Body: {{ $json.Text }}
```

### Adding Smart Filtering

Maybe you don't want to summarize every email. Let's add a filter:

1. Between Step 3 (Gmail) and Step 4 (OpenAI), add a new node
2. Search for "IF" and select "IF"
3. Set the condition to check if the email is from important senders or contains keywords
4. Connect the "true" output to the OpenAI node
5. Connect the "false" output to nothing (those emails get skipped)

Example condition:
- Value 1: `{{ $json.From }}`
- Operation: "contains"
- Value 2: "boss@company.com" OR "client@" OR "invoice"

### Adding Categories

You can have the AI categorize emails too:

Update your prompt in Step 4:
```
Summarize this email in 2-3 sentences. Also categorize it as one of: [Urgent], [Can Wait], [Newsletter], [Spam Risk].

From: {{ $json.From }}
Subject: {{ $json.Subject }}
Body: {{ $json.Text }}
```

Then in Step 5, update the formatting:
```
**From:** {{ $json.From }}
**Subject:** {{ $json.Subject }}
**Category:** {{ $json.choices[0].message.content.match(/\[(.*?)\]/)[1] }}
**Summary:** {{ $json.choices[0].message.content.replace(/\[.*?\]/, '') }}

---
```

---

## Chapter 6: Troubleshooting Common Issues

### Issue 1: "No credentials found"

**Symptom:** Node shows an error about missing credentials

**Fix:**
1. Go to the Credentials section in n8n
2. Make sure your Gmail and OpenAI credentials are created
3. In each node, use the dropdown to select the correct credential

### Issue 2: "API key invalid"

**Symptom:** OpenAI node fails with authentication error

**Fix:**
1. Verify your API key is correct (check for extra spaces)
2. Make sure you've added a payment method to OpenAI
3. Check if you've hit your usage limit
4. Generate a new API key if necessary

### Issue 3: Emails not being found

**Symptom:** Workflow runs but finds no emails

**Fix:**
1. Check Gmail - do you actually have unread emails?
2. In the Gmail node, remove the "Unread" filter temporarily to test
3. Verify the "After" date range isn't too restrictive
4. Make sure n8n has permission to access your Gmail

### Issue 4: Summaries are poor quality

**Symptom:** AI summaries are too short, too long, or miss the point

**Fix:**
1. Refine your prompt (see Chapter 5 for examples)
2. Try a different model (gpt-4o instead of gpt-4o-mini for better quality)
3. Check that the email body is being passed correctly (use "Test Step" to inspect)

### Issue 5: Workflow runs but no email arrives

**Symptom:** Everything seems to work but you don't receive the digest

**Fix:**
1. Check spam/junk folders
2. Verify the "To" address in the Gmail send node
3. Check n8n execution logs for errors
4. Make sure the aggregate node is combining items correctly

### Issue 6: "Rate limit exceeded"

**Symptom:** OpenAI node fails with rate limit error

**Fix:**
1. Add a "Wait" node between emails to slow down requests
2. Set the wait time to 1-2 seconds
3. Consider upgrading to a paid OpenAI tier for higher limits

### Issue 7: Costs are higher than expected

**Symptom:** OpenAI bills are adding up

**Fix:**
1. Switch to gpt-4o-mini (cheapest option)
2. Limit the number of emails processed (reduce "Maximum number of results")
3. Add filtering to only summarize important emails
4. Set a hard usage limit in OpenAI settings

### Issue 8: Workflow stops running

**Symptom:** Workflow was working but suddenly stops

**Fix:**
1. Check if your n8n instance is still running (if self-hosted)
2. Verify the workflow is still "Active"
3. Check execution history for errors
4. If using n8n Cloud, check if you've hit the execution limit

### Getting Help

If you're stuck:

1. **n8n Documentation:** [docs.n8n.io](https://docs.n8n.io)
2. **n8n Community Forum:** [community.n8n.io](https://community.n8n.io)
3. **OpenAI Documentation:** [platform.openai.com/docs](https://platform.openai.com/docs)
4. **Discord communities:** Both n8n and OpenAI have active Discord servers

When asking for help, include:
- What you were trying to do
- What actually happened
- Any error messages (exact text)
- Screenshots of your workflow

---

## Chapter 7: What You've Built and Where to Go Next

### Review: What You Built Today

You created a fully automated system that:
- Runs on a schedule (daily at 7 AM)
- Reads your unread emails
- Uses AI to understand and summarize them
- Delivers a formatted digest to your inbox
- Saves you time every single day

This is a real, working AI workflow. It's not a demo or a toy. It handles real data and creates real value.

### Skills You Learned

- **Workflow thinking:** Breaking processes into triggers, inputs, processing, and outputs
- **Tool integration:** Connecting different services to work together
- **AI prompting:** Giving AI clear instructions to get useful results
- **Error handling:** Testing, debugging, and fixing issues
- **Automation mindset:** Identifying repetitive tasks that can be automated

### Your Workflow Can Evolve

This email summarizer is just the beginning. You can extend it:

**Add actions:**
- Automatically draft replies to common questions
- Create calendar events from meeting requests
- Add action items to your task manager
- Forward urgent emails to your phone via SMS

**Change the schedule:**
- Run hourly for real-time updates
- Run weekly for a weekly digest
- Run on-demand via a button in a mobile app

**Expand the inputs:**
- Summarize Slack messages too
- Include calendar events for the day
- Add weather forecast
- Include news headlines

**Change the output:**
- Send to Telegram or Discord instead of email
- Create a Notion page with your daily digest
- Post to a private blog
- Save to a PDF

### Next Projects to Try

Now that you understand the basics, here are other workflows to build:

**1. Social Media Content Scheduler**
- Input: RSS feeds, news sites, your content calendar
- Processing: AI generates social media posts
- Output: Scheduled posts to Twitter, LinkedIn, etc.

**2. Customer Support Classifier**
- Input: New support tickets
- Processing: AI categorizes by urgency and topic
- Output: Routes to the right team member

**3. Meeting Notes Summarizer**
- Input: Recording transcript or notes
- Processing: AI extracts action items and decisions
- Output: Summary sent to attendees

**4. Invoice Processor**
- Input: New invoices in email
- Processing: AI extracts amounts, dates, vendor info
- Output: Adds to spreadsheet, alerts accounting

**5. Content Repurposer**
- Input: Your blog post or video transcript
- Processing: AI creates Twitter thread, LinkedIn post, newsletter excerpt
- Output: Publishes across platforms

### Resources for Continued Learning

**Communities:**
- n8n Community Forum
- r/automation (Reddit)
- AI automation Discord servers

**YouTube Channels:**
- n8n official channel
- Automation tutorials (search "n8n workflow tutorials")

**Documentation:**
- n8n workflow examples
- OpenAI cookbook

### The Automation Mindset

Going forward, whenever you find yourself:
- Doing the same task repeatedly
- Copying and pasting information between apps
- Spending time on low-value administrative work
- Missing important information because it got buried

Ask yourself: "Could I automate this?"

The answer is often yes. And now you have the skills to build it.

---

## Quick Reference: Your Workflow Summary

### Visual Overview

```
[Schedule Trigger: Daily 7 AM]
         ↓
[Gmail: Get unread emails (last 24h)]
         ↓
[OpenAI: Summarize each email]
         ↓
[Set: Format the summary]
         ↓
[Aggregate: Combine all summaries]
         ↓
[Gmail: Send digest email]
```

### Key Formulas/Values

**Schedule Trigger:** Daily at 07:00

**Gmail Get Messages:**
- Filter: Unread
- After: 1 day ago
- Max results: 20

**OpenAI Prompt:**
```
Summarize this email in 2-3 sentences. Identify if it requires a response or action.

From: {{ $json.From }}
Subject: {{ $json.Subject }}
Body: {{ $json.Text }}
```

**Formatting:**
```
**From:** {{ $json.From }}
**Subject:** {{ $json.Subject }}
**Summary:** {{ $json.choices[0].message.content }}

---
```

**Send Email:**
- To: your-email@gmail.com
- Subject: Your Daily Email Digest
- Body: Combined summaries

---

## Conclusion

You started this guide curious about AI workflows but perhaps unsure where to begin. Now you have:

- A working automation that saves you time daily
- The knowledge to build more workflows
- The confidence to tackle more complex automations
- A foundation for understanding how AI can work for you

The best part? This is just the beginning.

Every workflow you build compounds. The time you save goes into building the next one. The skills you learn multiply. The possibilities expand.

You don't need to be a programmer. You don't need expensive tools. You just need the willingness to try, test, and iterate.

Welcome to the world of AI automation. You've built your first workflow. What will you build next?

---

## Appendix A: Cost Estimation

### OpenAI Costs

| Model | Cost per 1K tokens | Typical email cost | 20 emails/day |
|-------|-------------------|-------------------|---------------|
| gpt-4o-mini | $0.00015 | $0.001 | $0.02/day |
| gpt-4o | $0.005 | $0.02 | $0.40/day |

At 20 emails per day using gpt-4o-mini:
- Daily: ~$0.02
- Monthly: ~$0.60
- Yearly: ~$7.20

**Tips to reduce costs:**
- Use gpt-4o-mini for most tasks
- Limit emails to 20 per day
- Filter emails before summarizing
- Truncate very long emails

### n8n Costs

**Self-hosted:** Free forever

**Cloud:**
- Starter: $20/month (2,500 workflow executions)
- Pro: $50/month (10,000 workflow executions)

For personal use, self-hosted is usually best.

---

## Appendix B: Security Checklist

- [ ] OpenAI API key stored securely (not in code or public repos)
- [ ] Usage limits set on OpenAI account
- [ ] n8n instance password protected
- [ ] Gmail permissions limited to necessary access
- [ ] No sensitive data logged in workflow execution history
- [ ] Regular backup of workflows (export JSON)

---

## Appendix C: Expanding the Prompt Library

### Basic Summary
```
Summarize this email in 2-3 sentences.

From: {{ $json.From }}
Subject: {{ $json.Subject }}
Body: {{ $json.Text }}
```

### Action-Oriented Summary
```
Read this email and extract:
1. Who sent it
2. What they want
3. What action you need to take (if any)
4. Any deadlines

Email:
From: {{ $json.From }}
Subject: {{ $json.Subject }}
Body: {{ $json.Text }}
```

### Prioritized Summary
```
Categorize this email as [URGENT], [Important], or [Low Priority] and explain why.
Then summarize the key points.

Email:
From: {{ $json.From }}
Subject: {{ $json.Subject }}
Body: {{ $json.Text }}
```

### Newsletter Summary
```
This is a newsletter. Extract the 3 most important points as bullet points. Skip promotional content.

Newsletter:
From: {{ $json.From }}
Subject: {{ $json.Subject }}
Body: {{ $json.Text }}
```

---

**End of Guide**

*Built with patience. Powered by AI. Ready to work for you.*
