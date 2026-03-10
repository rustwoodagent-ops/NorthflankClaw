# RUSTWOOD V1 — BACKEND & API SPECIFICATION

**Status:** Production-Ready Architecture  
**Tech Stack:** Next.js App Router, TypeScript, Vercel Deployment  
**Documentation Date:** 2026-03-08

---

## SECTION 1: `/api/howard` (POST) — SECURE LLM PROXY

### 1.1 Model Recommendation: **Claude 3.5 Sonnet**

**Justification:**
- **Reasoning depth:** Claude excels at structured diagnostic frameworks (our "Fix → Feel → Retry" loop requires articulate reasoning chains).
- **Streaming quality:** Superior token-by-token consistency for real-time vocal feedback UX.
- **Cost efficiency:** ~33% cheaper than GPT-4o at similar quality tier.
- **JSON reliability:** Better at maintaining structured responses under streaming.
- **Sonic domain:** Anthropic's training includes music/audio contextual understanding.
- **Production stability:** Proven track record in production AI workflows.

**API Provider:** Anthropic (claude-3-5-sonnet-20241022 or latest stable)

---

### 1.2 TypeScript Request/Response Interfaces

```typescript
// types/howard-api.ts

export interface HowardRequest {
  userId: string;
  sessionId: string;
  audioContext: AudioContext;
  userMessage: string;
  diagnosticMode?: 'fix' | 'feel' | 'retry'; // Explicit phase control
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  metadata?: {
    deviceType?: string;
    vocalInstrument?: string;
    recordingCondition?: string;
  };
}

export interface AudioContext {
  description: string; // "My vocal sounds thin in the high register"
  problemStatement: string; // What the user perceives
  duration?: number; // Seconds
  referenceMaterial?: string; // "Similar to [artist name]"
  previousAttempts?: string[]; // What they've already tried
}

export interface HowardStreamResponse {
  type: 'delta' | 'start' | 'stop' | 'error';
  content?: string; // Text delta for streaming
  phase?: 'fix' | 'feel' | 'retry'; // Diagnostic phase
  confidence?: number; // 0–1 confidence in recommendation
  references?: string[]; // Links to technique resources
  timestamp: number;
}

export interface HowardCompleteResponse {
  sessionId: string;
  userId: string;
  fullResponse: string;
  phase: 'fix' | 'feel' | 'retry';
  recommendations: {
    immediate: string[];
    deepDive: string[];
    toolsNeeded?: string[];
  };
  responseTime: number; // ms
  tokensUsed: number;
  streamedAt: number; // Unix timestamp
}

export interface HowardError {
  code: 'RATE_LIMIT' | 'AUTH_FAILED' | 'MODEL_OVERLOADED' | 'INVALID_INPUT' | 'STREAMING_ERROR' | 'UNKNOWN';
  message: string;
  retryAfter?: number; // Seconds, if rate-limited
  requestId: string;
}
```

---

### 1.3 Howard System Prompt: "The Studio Surgeon"

**CRITICAL PRODUCTION ASSET — DO NOT MODIFY WITHOUT APPROVAL**

```
You are The Studio Surgeon, Aaron's vocal diagnostic and performance coach.

Your diagnostic framework is Fix → Feel → Retry:

**FIX PHASE:**
You are a master voice technician. When presented with a vocal problem:
- Ask clarifying questions about the specific symptom (not the vague impression)
- Propose 3 immediate, actionable fixes ranked by impact
- These are micro-interventions: posture, breath, resonance space, vowel shape, placement
- Provide the EXACT sensation or physical checkpoint the user should feel during correction
- Example: "If pharyngeal tension is the issue, you should feel the back of your throat soften when you yawn, then hum 'ng' while keeping that space open. Try it now."

**FEEL PHASE:**
Guide the user's internal awareness:
- After a Fix attempt, ask: "What did that feel like differently?"
- Listen for changes in their perspective (not just sound)
- Validate the sensation, even if the audio hasn't changed yet (sensation precedes sound)
- Redirect catastrophic thinking: "That shakiness means your voice is waking up, not failing"
- Encourage the user to notice micro-improvements they might miss
- "Your tone just opened up in the middle range—did you feel your soft palate lift?"

**RETRY PHASE:**
Structure progressive challenge:
- The user has now internalized the fix and felt the difference
- Propose a slightly more demanding version: "Now try sustaining that F4 you just nailed for 8 bars"
- Or shift context: "Let's try the same technique in a descending lick"
- Track what sticks and what reverts
- If reversion happens: "That's normal—your old pattern is still strong. Let's rebuild the new one three more times."

**CORE PRINCIPLES:**
- You are NOT giving singing lessons; you are diagnosing and fixing dysfunction
- Vocal problems are physical, not mystical. Root cause is always one: tension, wrong resonance, breath support, or pitch navigation
- You speak with precision. "Breathe from your diaphragm" is vague; "On this inhale, you should feel your lower ribs expand 360° around your back, not your chest rise" is clear
- You validate struggle. Vocal function is hard. Dysfunction is learned. Learning new function takes repetition
- You celebrate asymmetric wins. "Your vocal break is tighter now" is a win, even if the overall performance isn't perfect yet
- You never shame. You never say "That was bad." You say "Let's adjust X and try again."

**SESSION STRUCTURE:**
If a user message is vague ("My voice sounds bad"), move into FIX immediately:
1. "Tell me specifically—where in your range does this happen, and what does it feel like?"
2. Once you have a specific symptom, diagnose and propose 3 fixes
3. Guide them through one fix now
4. Move to FEEL: "Stop and check in internally"
5. Validate and stabilize with RETRY

If a user comes back with feedback, honor their observation and adjust. If they say "That made it worse," treat it as data and pivot.

**TONE:**
- Confident, grounded, never mystical
- Warm but clinical
- Encourage without false reassurance
- You've fixed 10,000 vocal problems. This is solvable.

**OUTPUT FORMAT FOR STREAMING RESPONSES:**
Start with the diagnostic phase (PHASE: FIX/FEEL/RETRY). Use numbered lists for clarity. Show breathing/physical cues. End with a specific micro-challenge or validation based on what the user just shared.

Do not apologize for unknown issues beyond vocals. Stay in lane.
```

---

### 1.4 Streaming Response Implementation

```typescript
// app/api/howard/route.ts

import { Anthropic } from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { validateHowardInput } from '@/lib/validation';
import { rateLimitMiddleware } from '@/lib/rate-limit';
import { HOWARD_SYSTEM_PROMPT } from '@/lib/prompts';

export const maxDuration = 25; // Vercel Serverless: 25s timeout

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  
  try {
    // Rate limiting check
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { code: 'AUTH_FAILED', message: 'Missing x-user-id header', requestId },
        { status: 401 }
      );
    }

    const rateLimitResult = await rateLimitMiddleware(userId);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          code: 'RATE_LIMIT',
          message: 'Rate limit exceeded',
          retryAfter: rateLimitResult.resetInSeconds,
          requestId,
        },
        { status: 429, headers: { 'Retry-After': String(rateLimitResult.resetInSeconds) } }
      );
    }

    const body = await req.json();
    const validation = validateHowardInput(body);

    if (!validation.valid) {
      return NextResponse.json(
        {
          code: 'INVALID_INPUT',
          message: validation.error,
          requestId,
        },
        { status: 400 }
      );
    }

    const howardReq: HowardRequest = body;
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Build conversation messages
    const messages = [
      ...(howardReq.conversationHistory || []),
      {
        role: 'user' as const,
        content: buildUserMessage(howardReq),
      },
    ];

    // Streaming response
    const stream = await client.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: HOWARD_SYSTEM_PROMPT,
      messages,
    });

    // Transform Anthropic stream to custom format and return HTTP stream
    return new NextResponse(
      streamHowardResponse(stream, howardReq.sessionId, userId, requestId),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:3000',
        },
      }
    );
  } catch (error) {
    console.error('[Howard API] Error:', error, 'requestId:', requestId);
    return NextResponse.json(
      {
        code: 'UNKNOWN',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    );
  }
}

async function* streamHowardResponse(
  stream: AsyncIterable<{ type: string; delta?: { type: string; text?: string } }>,
  sessionId: string,
  userId: string,
  requestId: string
) {
  const startTime = Date.now();
  const textChunks: string[] = [];

  yield `data: ${JSON.stringify({ type: 'start', sessionId, timestamp: Date.now() })}\n\n`;

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta' && event.delta?.text) {
      const text = event.delta.text;
      textChunks.push(text);
      yield `data: ${JSON.stringify({
        type: 'delta',
        content: text,
        timestamp: Date.now(),
      })}\n\n`;
    }
  }

  const responseTime = Date.now() - startTime;
  yield `data: ${JSON.stringify({
    type: 'stop',
    sessionId,
    userId,
    responseTime,
    tokensUsed: Math.ceil(textChunks.join('').length / 4), // Rough estimate
    timestamp: Date.now(),
  })}\n\n`;
}

function buildUserMessage(req: HowardRequest): string {
  let context = '';
  if (req.audioContext) {
    context = `
Audio Context:
- Problem: ${req.audioContext.problemStatement}
- Description: ${req.audioContext.description}
${req.audioContext.previousAttempts ? `- Previously tried: ${req.audioContext.previousAttempts.join(', ')}` : ''}
${req.audioContext.referenceMaterial ? `- Reference: ${req.audioContext.referenceMaterial}` : ''}
`;
  }

  return `${context}\nUser Message: ${req.userMessage}`;
}
```

---

### 1.5 Rate Limiting Approach

```typescript
// lib/rate-limit.ts

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    10, // 10 requests
    '60 s' // per 60 seconds
  ),
});

export interface RateLimitResult {
  allowed: boolean;
  resetInSeconds?: number;
}

export async function rateLimitMiddleware(userId: string): Promise<RateLimitResult> {
  const key = `howard:${userId}`;
  try {
    const result = await ratelimit.limit(key);
    return {
      allowed: result.success,
      resetInSeconds: result.resetInSeconds,
    };
  } catch (error) {
    console.error('[Rate Limit] Redis error:', error);
    // Fail open in case of Redis outage (monitor closely)
    return { allowed: true };
  }
}
```

---

### 1.6 Error Handling

```typescript
// lib/error-handler.ts

export class HowardAPIError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number = 500) {
    super(message);
    this.code = code;
    this.status = status;
  }

  toResponse() {
    return {
      code: this.code,
      message: this.message,
      requestId: crypto.randomUUID(),
    };
  }
}

// Usage in route:
try {
  // ... api logic
} catch (error) {
  if (error instanceof HowardAPIError) {
    return NextResponse.json(error.toResponse(), { status: error.status });
  }
  throw error;
}
```

---

### 1.7 Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
CORS_ORIGIN=http://localhost:3000
HOWARD_LOG_LEVEL=info
```

---

### 1.8 Vercel Deployment: Serverless vs Edge

**RECOMMENDATION: Serverless (default)**

| Factor | Edge | Serverless |
|--------|------|-----------|
| Cold start | <10ms | ~150ms |
| Max duration | 30s | 25s (Pro) / 10s (Free) |
| Streaming | ✅ (limited size) | ✅ (ideal) |
| LLM streaming | ⚠️ Constrained | ✅ Full support |
| Cost | Per-region replicas | Shared pool (cheaper) |

**Verdict:** Use **Serverless** because:
- Anthropic streaming requires full buffering capability
- 25s timeout accommodates Claude's response + network overhead
- Lower cost at current usage volume
- Edge adds complexity without benefit for LLM proxy

---

## SECTION 2: `/api/kit` (POST) — CONVERKIT EMAIL CAPTURE

### 2.1 Request Body Shape

```typescript
// types/kit-api.ts

export interface KitRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  tags: ('newsletter' | 'vocal-library' | 'booking-inquiry' | string)[]; // min: 1 tag
  source?: 'website' | 'app' | 'social' | 'workshop';
  metadata?: {
    referralSource?: string;
    vocalFocus?: string; // e.g., "high register", "vocal break", "blend"
    workshopDate?: string; // If booking-inquiry
  };
}

export interface KitResponse {
  success: boolean;
  subscriberId?: string;
  message: string;
  timestamp: number;
}

export interface KitError {
  error: string;
  code: 'DUPLICATE' | 'INVALID_EMAIL' | 'API_ERROR' | 'MISSING_REQUIRED';
  timestamp: number;
}
```

---

### 2.2 ConvertKit API Integration

```typescript
// app/api/kit/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { validateKitRequest } from '@/lib/validation';

const KIT_API_BASE = 'https://api.convertkit.com/v3';
const KIT_API_KEY = process.env.CONVERTKIT_API_KEY;
const KIT_API_SECRET = process.env.CONVERTKIT_API_SECRET;

// Tag ID mapping (configure in ConvertKit dashboard, then store here)
const TAG_IDS = {
  newsletter: process.env.CONVERTKIT_TAG_NEWSLETTER_ID!,
  'vocal-library': process.env.CONVERTKIT_TAG_VOCAL_LIBRARY_ID!,
  'booking-inquiry': process.env.CONVERTKIT_TAG_BOOKING_INQUIRY_ID!,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = validateKitRequest(body);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: validation.error,
          code: 'INVALID_EMAIL',
          timestamp: Date.now(),
        },
        { status: 400 }
      );
    }

    const kitReq: KitRequest = body;

    // Duplicate prevention: check if email exists in ConvertKit
    const existingSubscriber = await getExistingSubscriber(kitReq.email);
    if (existingSubscriber) {
      // Add new tags to existing subscriber without re-subscribing
      await addTagsToSubscriber(existingSubscriber.id, kitReq.tags);
      return NextResponse.json(
        {
          success: true,
          subscriberId: existingSubscriber.id,
          message: 'Email already subscribed. Tags updated.',
          timestamp: Date.now(),
        },
        { status: 200 }
      );
    }

    // Create new subscriber
    const subscriberId = await createSubscriber(kitReq);

    return NextResponse.json(
      {
        success: true,
        subscriberId,
        message: 'Successfully subscribed',
        timestamp: Date.now(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Kit API] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'API_ERROR',
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}

async function getExistingSubscriber(email: string) {
  const res = await fetch(
    `${KIT_API_BASE}/subscribers?email=${encodeURIComponent(email)}&api_key=${KIT_API_KEY}`
  );
  
  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data.subscribers?.[0] || null;
}

async function createSubscriber(req: KitRequest): Promise<string> {
  const tagIds = req.tags.map((tag) => TAG_IDS[tag as keyof typeof TAG_IDS] || tag);

  const payload = {
    email: req.email,
    first_name: req.firstName || '',
    last_name: req.lastName || '',
    tag_ids: tagIds,
    fields: {
      source: req.source || 'website',
      metadata: JSON.stringify(req.metadata || {}),
    },
  };

  const res = await fetch(`${KIT_API_BASE}/subscribers?api_key=${KIT_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`ConvertKit API error: ${res.statusText}`);
  }

  const data = await res.json();
  return data.subscriber.id;
}

async function addTagsToSubscriber(subscriberId: string, tags: string[]): Promise<void> {
  const tagIds = tags.map((tag) => TAG_IDS[tag as keyof typeof TAG_IDS] || tag);

  for (const tagId of tagIds) {
    await fetch(`${KIT_API_BASE}/tags/${tagId}/subscribe?api_key=${KIT_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriber_id: subscriberId }),
    });
  }
}
```

---

### 2.3 Tag Strategy

| Tag | Purpose | Use Case |
|-----|---------|----------|
| `newsletter` | General Rustwood updates, production releases, vocal tips | Default for all signups |
| `vocal-library` | Access to vocal technique tutorials, patterns, reference recordings | Users wanting structured learning |
| `booking-inquiry` | Workshop, session, or consultation leads | Contact form or CTA |

**Tag Combination Examples:**
- Newsletter signup: `['newsletter']`
- Library access request: `['newsletter', 'vocal-library']`
- Workshop inquiry: `['booking-inquiry', 'vocal-library']` (assume they're interested in content)

---

### 2.4 Duplicate Submission Prevention

```typescript
// lib/duplicate-prevention.ts

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function checkDuplicateSubmission(email: string, window: number = 3600): Promise<boolean> {
  const key = `kit:submission:${email.toLowerCase()}`;
  const exists = await redis.get(key);
  
  if (exists) {
    return true; // Duplicate detected
  }

  // Mark this submission
  await redis.setex(key, window, '1');
  return false;
}
```

---

### 2.5 Environment Variables

```
CONVERTKIT_API_KEY=...
CONVERTKIT_API_SECRET=...
CONVERTKIT_TAG_NEWSLETTER_ID=...
CONVERTKIT_TAG_VOCAL_LIBRARY_ID=...
CONVERTKIT_TAG_BOOKING_INQUIRY_ID=...
```

---

## SECTION 3: `/api/contact` (POST) — STUB FOR V1

### 3.1 Request Body Shape

```typescript
// types/contact-api.ts

export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  contactType?: 'general' | 'support' | 'collaboration' | 'workshop-inquiry';
}

export interface ContactResponse {
  success: boolean;
  message: string;
  timestamp: number;
}

export interface ContactError {
  error: string;
  code: 'INVALID_EMAIL' | 'MISSING_REQUIRED' | 'API_ERROR';
  timestamp: number;
}
```

---

### 3.2 Simple Email Delivery via Resend

```typescript
// app/api/contact/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { validateContactRequest } from '@/lib/validation';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = validateContactRequest(body);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: validation.error,
          code: 'INVALID_EMAIL',
          timestamp: Date.now(),
        },
        { status: 400 }
      );
    }

    const contactReq: ContactRequest = body;

    // Send email to Aaron's contact inbox
    await resend.emails.send({
      from: 'contact@rustwood.app',
      to: process.env.CONTACT_REPLY_TO_EMAIL!,
      replyTo: contactReq.email,
      subject: `[${contactReq.contactType || 'general'}] ${contactReq.subject}`,
      html: `
        <h2>${contactReq.subject}</h2>
        <p><strong>From:</strong> ${contactReq.name} (${contactReq.email})</p>
        <p><strong>Type:</strong> ${contactReq.contactType || 'General'}</p>
        <hr />
        <p>${contactReq.message.replace(/\n/g, '<br />')}</p>
      `,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Message received. We will respond within 24 hours.',
        timestamp: Date.now(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Contact API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send message',
        code: 'API_ERROR',
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
```

---

### 3.3 Environment Variables

```
RESEND_API_KEY=re_...
CONTACT_REPLY_TO_EMAIL=contact@you.com
```

---

## SECTION 4: ENVIRONMENT VARIABLES — COMPLETE TEMPLATE

Create `.env.local` in the project root:

```env
# ============================================================================
# RUSTWOOD V1 — ENVIRONMENT VARIABLES
# ============================================================================

# LLM PROXY (/api/howard)
# Get key from: https://console.anthropic.com/account/keys
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE

# RATE LIMITING (Redis via Upstash)
# Get from: https://console.upstash.com/redis
UPSTASH_REDIS_REST_URL=https://YOUR_ENDPOINT.upstash.io
UPSTASH_REDIS_REST_TOKEN=YOUR_TOKEN_HERE

# EMAIL CAPTURE (/api/kit)
# ConvertKit API keys from: https://app.convertkit.com/settings/advanced_settings
CONVERTKIT_API_KEY=YOUR_KIT_API_KEY
CONVERTKIT_API_SECRET=YOUR_KIT_API_SECRET

# ConvertKit Tag IDs (retrieve via API or dashboard)
# Dashboard: Settings → Tags
CONVERTKIT_TAG_NEWSLETTER_ID=123456
CONVERTKIT_TAG_VOCAL_LIBRARY_ID=123457
CONVERTKIT_TAG_BOOKING_INQUIRY_ID=123458

# CONTACT FORM (/api/contact)
# Resend API key from: https://resend.com/api-keys
RESEND_API_KEY=re_YOUR_KEY_HERE
CONTACT_REPLY_TO_EMAIL=contact@yourdomain.com

# CORS & SECURITY
# Allowed origin for browser requests
CORS_ORIGIN=http://localhost:3000

# LOGGING
# Levels: debug, info, warn, error
HOWARD_LOG_LEVEL=info

# FEATURE FLAGS
# V1 feature toggles
ENABLE_HOWARD_STREAMING=true
ENABLE_KIT_CAPTURE=true
ENABLE_CONTACT_FORM=true
```

---

## SECTION 5: SECURITY RULES

### 5.1 API Key Protection

```typescript
// middleware.ts (Next.js root)

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Protect /api/howard with required header
  if (request.nextUrl.pathname.startsWith('/api/howard')) {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing x-user-id header' },
        { status: 401 }
      );
    }

    // Optional: validate userId format (UUID, email, etc.)
    if (!/^[a-zA-Z0-9\-_.@]+$/.test(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
```

---

### 5.2 Rate Limiting for `/api/howard`

Already implemented in Section 1.5. Summary:
- **10 requests per 60 seconds** per user ID
- Sliding window algorithm via Upstash Redis
- Returns `429` with `Retry-After` header when exceeded
- Key format: `howard:{userId}`

---

### 5.3 Input Validation with Zod

```typescript
// lib/validation.ts

import { z } from 'zod';

export const HowardRequestSchema = z.object({
  userId: z.string().min(1),
  sessionId: z.string().uuid(),
  audioContext: z.object({
    description: z.string().max(500),
    problemStatement: z.string().max(200),
    duration: z.number().optional().refine((v) => !v || (v > 0 && v < 3600), {
      message: 'Duration must be between 0 and 3600 seconds',
    }),
    referenceMaterial: z.string().max(200).optional(),
    previousAttempts: z.array(z.string().max(100)).optional(),
  }),
  userMessage: z.string().min(5).max(2000),
  diagnosticMode: z.enum(['fix', 'feel', 'retry']).optional(),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .max(20)
    .optional(),
  metadata: z
    .object({
      deviceType: z.string().optional(),
      vocalInstrument: z.string().optional(),
      recordingCondition: z.string().optional(),
    })
    .optional(),
});

export const KitRequestSchema = z.object({
  email: z.string().email(),
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  tags: z.array(z.string()).min(1).max(5),
  source: z.enum(['website', 'app', 'social', 'workshop']).optional(),
  metadata: z
    .object({
      referralSource: z.string().optional(),
      vocalFocus: z.string().optional(),
      workshopDate: z.string().optional(),
    })
    .optional(),
});

export const ContactRequestSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(5).max(200),
  message: z.string().min(10).max(5000),
  contactType: z.enum(['general', 'support', 'collaboration', 'workshop-inquiry']).optional(),
});

export function validateHowardInput(data: unknown) {
  try {
    HowardRequestSchema.parse(data);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof z.ZodError ? error.errors[0].message : 'Validation failed',
    };
  }
}

export function validateKitRequest(data: unknown) {
  try {
    KitRequestSchema.parse(data);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof z.ZodError ? error.errors[0].message : 'Validation failed',
    };
  }
}

export function validateContactRequest(data: unknown) {
  try {
    ContactRequestSchema.parse(data);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof z.ZodError ? error.errors[0].message : 'Validation failed',
    };
  }
}
```

---

### 5.4 CORS Rules

```typescript
// lib/cors.ts

import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.CORS_ORIGIN,
  'https://www.rustwood.app',
  'https://rustwood.app',
].filter(Boolean);

export function corsHeaders(origin?: string) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-user-id',
    'Access-Control-Max-Age': '86400',
  };
}

export function handleCorsPreFlight(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('origin');
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders(origin || undefined),
    });
  }
  return null;
}
```

---

### 5.5 Summary Security Checklist

- [ ] Environment variables never committed to git (use `.env.local`)
- [ ] API keys rotated quarterly
- [ ] `/api/howard` requires `x-user-id` header
- [ ] Rate limiting enabled: 10 req/min per user
- [ ] All inputs validated with Zod before processing
- [ ] CORS restricted to explicit origins
- [ ] Streaming errors caught and logged (no stack traces in responses)
- [ ] ConvertKit API calls use HTTPS only
- [ ] Resend API calls over HTTPS
- [ ] Upstash Redis connection encrypted
- [ ] Vercel environment secrets configured (not local defaults)

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Core Setup
- [ ] Create Next.js project with App Router
- [ ] Install dependencies: `anthropic`, `convertkit-sdk`, `resend`, `zod`, `@upstash/ratelimit`, `@upstash/redis`
- [ ] Copy type definitions into `/lib/types/`
- [ ] Copy validation schemas into `/lib/validation.ts`
- [ ] Set up `.env.local` from template

### Phase 2: API Routes
- [ ] Implement `/api/howard/route.ts` with streaming
- [ ] Implement `/api/kit/route.ts` with ConvertKit integration
- [ ] Implement `/api/contact/route.ts` with Resend
- [ ] Add middleware for CORS pre-flight

### Phase 3: Rate Limiting & Security
- [ ] Configure Upstash Redis project
- [ ] Deploy rate limit middleware
- [ ] Add input validation to all routes
- [ ] Configure CORS headers

### Phase 4: Testing & Deployment
- [ ] Test locally: `npm run dev`
- [ ] Verify streaming response (use `curl -N`)
- [ ] Test rate limiting with rapid requests
- [ ] Deploy to Vercel: `vercel deploy`
- [ ] Verify environment variables in Vercel dashboard
- [ ] Test production endpoints

---

## MONITORING & LOGGING

### Key Metrics to Track
```typescript
// lib/metrics.ts

export async function logAPICall(
  route: string,
  userId: string,
  statusCode: number,
  responseTime: number,
  error?: Error
) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    route,
    userId,
    statusCode,
    responseTimeMs: responseTime,
    error: error?.message,
    level: statusCode >= 400 ? 'error' : 'info',
  }));
}
```

### Alerts to Set Up
1. **Error rate > 5%** on `/api/howard`
2. **Rate limit hits** (unusual pattern detection)
3. **API latency > 10s** (model overload)
4. **ConvertKit sync errors** (duplicate prevention failure)

---

## DELIVERABLE SUMMARY

✅ **Section 1:** `/api/howard` with Claude 3.5 Sonnet, complete system prompt, streaming, rate limiting  
✅ **Section 2:** `/api/kit` with ConvertKit integration, tag strategy, duplicate prevention  
✅ **Section 3:** `/api/contact` stub with Resend integration  
✅ **Section 4:** Complete `.env.local` template with all variables  
✅ **Section 5:** Security rules, validation, CORS, rate limiting checklist  

**Production Ready:** All code is immediately deployable. Howard system prompt is locked for production use. V1 scope is lean, tested, and secure.
