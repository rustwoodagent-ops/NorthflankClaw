import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, desc, and } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/trpc";
import { recordings, analyses, users } from "@/lib/db/schema";
import { getUploadUrl, getDownloadUrl, buildRecordingKey } from "@/lib/s3";
import { audioQueue } from "@/lib/queue";
import { v4 as uuidv4 } from "uuid";

// Per-tier analysis limits
const TIER_LIMITS = { free: 3, basic: 10, pro: 50 };

export const recordingsRouter = createTRPCRouter({
  // ─── Request pre-signed upload URL ────────────────────────────
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        durationSec: z.number().optional(),
        title: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;

      // Check monthly limit
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      // Reset monthly counter if needed
      const now = new Date();
      const resetDate = new Date(user.analysesResetAt);
      if (
        now.getMonth() !== resetDate.getMonth() ||
        now.getFullYear() !== resetDate.getFullYear()
      ) {
        await ctx.db
          .update(users)
          .set({ analysesUsedThisMonth: 0, analysesResetAt: now })
          .where(eq(users.id, userId));
        user.analysesUsedThisMonth = 0;
      }

      const limit = TIER_LIMITS[user.subscriptionTier];
      if (user.analysesUsedThisMonth >= limit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Monthly limit of ${limit} analyses reached. Upgrade to continue.`,
        });
      }

      // Create recording record
      const recordingId = uuidv4();
      const ext = input.filename.split(".").pop() || "webm";
      const s3Key = buildRecordingKey(userId, recordingId, ext);

      await ctx.db.insert(recordings).values({
        id: recordingId,
        userId,
        title:
          input.title ||
          `Recording ${new Date().toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}`,
        status: "uploading",
        durationSec: input.durationSec,
        fileFormat: ext,
        originalS3Key: s3Key,
      });

      const uploadUrl = await getUploadUrl(s3Key, input.contentType);

      return { recordingId, uploadUrl, s3Key };
    }),

  // ─── Confirm upload and enqueue processing ────────────────────
  confirmUpload: protectedProcedure
    .input(
      z.object({
        recordingId: z.string().uuid(),
        durationSec: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;

      const recording = await ctx.db.query.recordings.findFirst({
        where: and(
          eq(recordings.id, input.recordingId),
          eq(recordings.userId, userId)
        ),
      });
      if (!recording) throw new TRPCError({ code: "NOT_FOUND" });

      // Update duration, move to next stage
      await ctx.db
        .update(recordings)
        .set({ status: "separating", durationSec: input.durationSec })
        .where(eq(recordings.id, input.recordingId));

      // Increment usage counter
      await ctx.db
        .update(users)
        .set({
          analysesUsedThisMonth: ctx.db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .then(() => {}),
        })
        .where(eq(users.id, userId));

      // Enqueue processing job
      await audioQueue.add(
        "process-recording",
        {
          recordingId: input.recordingId,
          userId,
          s3Key: recording.originalS3Key,
          fileFormat: recording.fileFormat,
          title: recording.title,
        },
        {
          jobId: `process-${input.recordingId}`,
          priority: 1,
        }
      );

      return { queued: true };
    }),

  // ─── List user's recordings ──────────────────────────────────
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;

      const rows = await ctx.db.query.recordings.findMany({
        where: eq(recordings.userId, userId),
        orderBy: desc(recordings.createdAt),
        limit: input.limit,
        offset: input.offset,
        with: { analysis: { columns: { id: true, archetype: true } } },
      });

      return rows;
    }),

  // ─── Get single recording with analysis ──────────────────────
  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;

      const recording = await ctx.db.query.recordings.findFirst({
        where: and(
          eq(recordings.id, input.id),
          eq(recordings.userId, userId)
        ),
        with: { analysis: true },
      });

      if (!recording) throw new TRPCError({ code: "NOT_FOUND" });

      // Generate fresh signed URLs for stems
      const stemUrls: Record<string, string> = {};
      if (recording.vocalsS3Key) {
        stemUrls.vocals = await getDownloadUrl(recording.vocalsS3Key);
      }
      if (recording.backingS3Key) {
        stemUrls.backing = await getDownloadUrl(recording.backingS3Key);
      }
      stemUrls.original = await getDownloadUrl(recording.originalS3Key);

      return { recording, stemUrls };
    }),

  // ─── Delete recording ────────────────────────────────────────
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;

      const recording = await ctx.db.query.recordings.findFirst({
        where: and(
          eq(recordings.id, input.id),
          eq(recordings.userId, userId)
        ),
      });
      if (!recording) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.db
        .delete(recordings)
        .where(eq(recordings.id, input.id));

      return { deleted: true };
    }),
});
