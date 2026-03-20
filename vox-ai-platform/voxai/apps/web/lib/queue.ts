import { Queue, Worker, QueueEvents } from "bullmq";
import IORedis from "ioredis";

// Singleton Redis connection
const globalForRedis = globalThis as unknown as { redis: IORedis };

export const redis =
  globalForRedis.redis ||
  new IORedis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// ─── Queue Definitions ────────────────────────────────────────────
export const QUEUE_NAME = "audio-processing";

export interface AudioProcessingJob {
  recordingId: string;
  userId: string;
  s3Key: string;
  fileFormat: string;
  title: string;
}

export const audioQueue = new Queue<AudioProcessingJob>(QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export const audioQueueEvents = new QueueEvents(QUEUE_NAME, {
  connection: redis,
});

// ─── Progress event keys ──────────────────────────────────────────
export function progressKey(recordingId: string): string {
  return `voxai:progress:${recordingId}`;
}

export async function publishProgress(
  recordingId: string,
  stage: string,
  progress: number,
  message: string
): Promise<void> {
  const event = JSON.stringify({ stage, progress, message, timestamp: Date.now() });
  await redis.publish(progressKey(recordingId), event);
  // Also store latest state for polling fallback
  await redis.setex(`voxai:status:${recordingId}`, 3600, event);
}
