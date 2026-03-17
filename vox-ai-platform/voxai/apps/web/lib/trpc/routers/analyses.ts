import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/trpc";
import { analyses, recordings } from "@/lib/db/schema";
import { getDownloadUrl } from "@/lib/s3";
import { buildPhraseBreakdownPrompt } from "@/lib/ai/prompts";

const anthropic = new Anthropic();

export const analysesRouter = createTRPCRouter({
  // ─── Get full analysis ────────────────────────────────────────
  get: protectedProcedure
    .input(z.object({ recordingId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;

      const analysis = await ctx.db.query.analyses.findFirst({
        where: and(
          eq(analyses.recordingId, input.recordingId),
          eq(analyses.userId, userId)
        ),
        with: { recording: true },
      });

      if (!analysis) throw new TRPCError({ code: "NOT_FOUND" });

      // Signed URL for spectrogram if available
      let spectrogramUrl: string | null = null;
      if (analysis.spectrogramS3Key) {
        spectrogramUrl = await getDownloadUrl(analysis.spectrogramS3Key);
      }

      return { analysis, spectrogramUrl };
    }),

  // ─── Request phrase-by-phrase breakdown (premium) ────────────
  requestPhraseBreakdown: protectedProcedure
    .input(z.object({ analysisId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;

      const analysis = await ctx.db.query.analyses.findFirst({
        where: and(
          eq(analyses.id, input.analysisId),
          eq(analyses.userId, userId)
        ),
        with: { recording: true },
      });

      if (!analysis) throw new TRPCError({ code: "NOT_FOUND" });
      if (analysis.phraseBreakdown) {
        return { breakdown: analysis.phraseBreakdown }; // Already done
      }

      // Build Claude phrase breakdown call
      const prompt = buildPhraseBreakdownPrompt({
        transcriptWords: analysis.transcriptWords as any[] || [],
        transcriptText: analysis.transcriptText || "",
        acousticFeatures: analysis.acousticFeatures as any,
        f0Frames: analysis.f0Frames as number[] || [],
        existingReport: analysis.report as any,
        durationSec: analysis.recording?.durationSec || 0,
      });

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: prompt.system,
        messages: [{ role: "user", content: prompt.user }],
      });

      const responseText = message.content
        .filter((b) => b.type === "text")
        .map((b) => (b as any).text)
        .join("");

      // Parse JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to parse AI response" });

      const breakdown = JSON.parse(jsonMatch[0]);

      // Store it
      await ctx.db
        .update(analyses)
        .set({
          phraseBreakdown: breakdown,
          phraseBreakdownRequestedAt: new Date(),
        })
        .where(eq(analyses.id, input.analysisId));

      return { breakdown };
    }),

  // ─── Follow-up chat with Howard ──────────────────────────────
  chat: protectedProcedure
    .input(
      z.object({
        analysisId: z.string().uuid(),
        message: z.string().min(1).max(500),
        history: z.array(
          z.object({ role: z.enum(["user", "assistant"]), content: z.string() })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;

      const analysis = await ctx.db.query.analyses.findFirst({
        where: and(
          eq(analyses.id, input.analysisId),
          eq(analyses.userId, userId)
        ),
      });
      if (!analysis) throw new TRPCError({ code: "NOT_FOUND" });

      const report = analysis.report as any;
      const features = analysis.acousticFeatures as any;

      const systemPrompt = `You are Howard, an expert vocal coach at VOX AI. You have just completed a full analysis of a singer's recording.

Here is the analysis context:
- Archetype: ${report.archetype}
- Overall impression: ${report.overallImpression}
- Priority areas: ${report.priorityAreas?.map((p: any) => p.title).join(", ")}
- Key acoustic findings: Mean F0: ${features.meanF0?.toFixed(1)}Hz, Jitter: ${features.jitterPct?.toFixed(2)}%, Shimmer: ${features.shimmerPct?.toFixed(2)}%, HPR: ${features.hprDb?.toFixed(1)}dB

Answer follow-up questions about the analysis. Be specific, encouraging, and pedagogically sound. Reference the actual measurements when helpful. Keep responses concise (2-4 paragraphs max).`;

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          ...input.history.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user", content: input.message },
        ],
      });

      const reply = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as any).text)
        .join("");

      return { reply };
    }),
});
