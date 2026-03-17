/**
 * Audio Processing Worker
 * Runs as a separate Node.js process. Processes one recording through:
 * separate → transcribe → analyse → diagnose → store report
 *
 * Start with: node dist/worker.js
 */

import { Worker, Job } from "bullmq";
import Anthropic from "@anthropic-ai/sdk";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { recordings, analyses } from "../lib/db/schema";
import { redis, QUEUE_NAME, AudioProcessingJob, publishProgress } from "../lib/queue";
import { getDownloadUrl, buildStemKey, buildSpectrogramKey } from "../lib/s3";
import { buildDiagnosticPrompt } from "../lib/ai/prompts";
import type { AcousticFeatures, Transcript } from "@voxai/shared/types";

const PYTHON_WORKER_URL = process.env.PYTHON_WORKER_URL || "http://localhost:8001";
const anthropic = new Anthropic();

// ─── Helper: call Python microservice ────────────────────────────────────────
async function callPythonWorker<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${PYTHON_WORKER_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(300_000), // 5 min timeout
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Python worker error ${res.status}: ${error}`);
  }

  return res.json();
}

// ─── Main job processor ───────────────────────────────────────────────────────
async function processAudioJob(job: Job<AudioProcessingJob>): Promise<void> {
  const { recordingId, userId, s3Key, fileFormat } = job.data;
  const startTime = Date.now();

  console.log(`[Worker] Starting job ${job.id} for recording ${recordingId}`);

  // ── Stage 1: Source Separation ─────────────────────────────────────────────
  await publishProgress(recordingId, "separating", 10, "Separating vocals from backing track...");
  await db.update(recordings).set({ status: "separating" }).where(eq(recordings.id, recordingId));

  const originalUrl = await getDownloadUrl(s3Key, 3600);

  const separationResult = await callPythonWorker<{
    vocals_s3_key: string;
    accompaniment_s3_key: string;
    bass_s3_key: string;
    drums_s3_key: string;
  }>("/worker/separate", {
    audio_url: originalUrl,
    recording_id: recordingId,
    user_id: userId,
    file_format: fileFormat,
  });

  await db.update(recordings).set({
    vocalsS3Key: separationResult.vocals_s3_key,
    backingS3Key: separationResult.accompaniment_s3_key,
    bassS3Key: separationResult.bass_s3_key,
    drumsS3Key: separationResult.drums_s3_key,
  }).where(eq(recordings.id, recordingId));

  await publishProgress(recordingId, "transcribing", 30, "Transcribing lyrics...");

  // ── Stage 2: Transcription ─────────────────────────────────────────────────
  await db.update(recordings).set({ status: "transcribing" }).where(eq(recordings.id, recordingId));

  const vocalsUrl = await getDownloadUrl(separationResult.vocals_s3_key, 3600);

  const transcriptionResult = await callPythonWorker<{
    text: string;
    words: { word: string; start: number; end: number; confidence: number }[];
    no_speech_detected: boolean;
  }>("/worker/transcribe", {
    audio_url: vocalsUrl,
    recording_id: recordingId,
  });

  const transcript: Transcript = {
    text: transcriptionResult.text,
    words: transcriptionResult.words,
    noSpeechDetected: transcriptionResult.no_speech_detected,
  };

  await publishProgress(recordingId, "measuring", 50, "Extracting acoustic features...");

  // ── Stage 3: Acoustic Analysis ─────────────────────────────────────────────
  await db.update(recordings).set({ status: "measuring" }).where(eq(recordings.id, recordingId));

  const acousticResult = await callPythonWorker<{
    features: AcousticFeatures;
    f0_frames: number[];
    spectrogram_s3_key: string | null;
    duration_sec: number;
  }>("/worker/analyse", {
    audio_url: vocalsUrl,
    recording_id: recordingId,
    user_id: userId,
  });

  // Update duration from actual audio
  await db.update(recordings).set({
    durationSec: acousticResult.duration_sec,
    status: "diagnosing",
  }).where(eq(recordings.id, recordingId));

  await publishProgress(recordingId, "diagnosing", 70, "Generating coaching report...");

  // ── Stage 4: AI Diagnostic Report ─────────────────────────────────────────
  const { system, user: userPrompt } = buildDiagnosticPrompt({
    acousticFeatures: acousticResult.features,
    transcript,
    durationSec: acousticResult.duration_sec,
    f0Frames: acousticResult.f0_frames,
  });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: userPrompt }],
  });

  const responseText = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as Anthropic.TextBlock).text)
    .join("");

  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Claude did not return valid JSON in diagnostic response");
  }
  const report = JSON.parse(jsonMatch[0]);

  await publishProgress(recordingId, "complete", 95, "Saving results...");

  // ── Stage 5: Store Results ─────────────────────────────────────────────────
  const processingMs = Date.now() - startTime;

  await db.insert(analyses).values({
    recordingId,
    userId,
    transcriptText: transcript.text,
    transcriptWords: transcript.words,
    noSpeechDetected: transcript.noSpeechDetected,
    acousticFeatures: acousticResult.features as any,
    f0Frames: acousticResult.f0_frames as any,
    spectrogramS3Key: acousticResult.spectrogram_s3_key,
    report: report as any,
    archetype: report.archetype,
    processingMs,
  });

  await db.update(recordings).set({ status: "complete" }).where(eq(recordings.id, recordingId));

  await publishProgress(recordingId, "complete", 100, "Analysis complete!");

  console.log(`[Worker] Job ${job.id} complete in ${processingMs}ms`);
}

// ─── Instantiate worker ───────────────────────────────────────────────────────
const worker = new Worker<AudioProcessingJob>(
  QUEUE_NAME,
  processAudioJob,
  {
    connection: redis,
    concurrency: 2, // Process up to 2 jobs in parallel
    limiter: {
      max: 10,
      duration: 60_000, // Max 10 jobs per minute
    },
  }
);

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

worker.on("failed", async (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);

  if (job?.data?.recordingId) {
    await db.update(recordings).set({
      status: "error",
      errorMessage: err.message,
    }).where(eq(recordings.id, job.data.recordingId));

    await publishProgress(job.data.recordingId, "error", 0, `Processing failed: ${err.message}`);
  }
});

worker.on("error", (err) => {
  console.error("[Worker] Queue error:", err);
});

console.log(`[Worker] Audio processing worker started. Listening on queue: ${QUEUE_NAME}`);

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[Worker] Shutting down...");
  await worker.close();
  process.exit(0);
});
