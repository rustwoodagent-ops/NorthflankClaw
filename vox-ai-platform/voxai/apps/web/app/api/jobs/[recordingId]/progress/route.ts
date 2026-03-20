import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/queue";
import { db } from "@/lib/db";
import { recordings } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/jobs/[recordingId]/progress
 *
 * Server-Sent Events stream for job progress updates.
 * The client subscribes and receives stage updates in real time.
 *
 * Events:
 *   data: { stage, progress, message, timestamp }
 *
 * The stream closes when status reaches "complete" or "error",
 * or after a 5-minute timeout.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { recordingId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { recordingId } = params;

  // Verify ownership
  const recording = await db.query.recordings.findFirst({
    where: and(
      eq(recordings.id, recordingId),
      eq(recordings.userId, session.user.id)
    ),
    columns: { id: true, status: true },
  });

  if (!recording) {
    return new NextResponse("Not found", { status: 404 });
  }

  // If already complete, return immediately
  if (recording.status === "complete" || recording.status === "error") {
    const data = JSON.stringify({
      stage: recording.status,
      progress: recording.status === "complete" ? 100 : 0,
      message:
        recording.status === "complete"
          ? "Analysis complete!"
          : "Processing failed",
    });
    return new NextResponse(`data: ${data}\n\n`, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // Subscribe to Redis pub/sub channel
  const channelKey = `voxai:progress:${recordingId}`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Create a dedicated subscriber connection
      const subscriber = redis.duplicate();
      let closed = false;
      let timeoutId: NodeJS.Timeout;

      const cleanup = async () => {
        if (closed) return;
        closed = true;
        clearTimeout(timeoutId);
        try {
          await subscriber.unsubscribe(channelKey);
          subscriber.disconnect();
        } catch {}
        controller.close();
      };

      // Check for a stored latest state first (in case we missed events)
      const stored = await redis.get(`voxai:status:${recordingId}`);
      if (stored) {
        controller.enqueue(encoder.encode(`data: ${stored}\n\n`));
        const parsed = JSON.parse(stored);
        if (parsed.stage === "complete" || parsed.stage === "error") {
          await cleanup();
          return;
        }
      }

      // Send heartbeat every 15s to keep connection alive
      const heartbeatId = setInterval(() => {
        if (!closed) {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        }
      }, 15_000);

      // Auto-close after 6 minutes
      timeoutId = setTimeout(async () => {
        clearInterval(heartbeatId);
        await cleanup();
      }, 360_000);

      // Subscribe to Redis
      await subscriber.subscribe(channelKey, async (message) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${message}\n\n`));

        const event = JSON.parse(message);
        if (event.stage === "complete" || event.stage === "error") {
          clearInterval(heartbeatId);
          await cleanup();
        }
      });

      // Handle client disconnect
      req.signal.addEventListener("abort", async () => {
        clearInterval(heartbeatId);
        await cleanup();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}
