import {
  pgTable,
  text,
  timestamp,
  uuid,
  real,
  integer,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Users ──────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  subscriptionTier: text("subscription_tier")
    .$type<"free" | "basic" | "pro">()
    .default("free")
    .notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  analysesUsedThisMonth: integer("analyses_used_this_month").default(0).notNull(),
  analysesResetAt: timestamp("analyses_reset_at", { mode: "date" })
    .defaultNow()
    .notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── Auth (NextAuth adapter tables) ──────────────────────────────
export const accounts = pgTable("accounts", {
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// ─── Recordings ──────────────────────────────────────────────────
export const recordings = pgTable(
  "recordings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("Untitled Recording"),
    status: text("status")
      .$type<
        | "uploading"
        | "separating"
        | "transcribing"
        | "measuring"
        | "diagnosing"
        | "complete"
        | "error"
      >()
      .default("uploading")
      .notNull(),
    durationSec: real("duration_sec"),
    fileFormat: text("file_format").notNull().default("webm"),
    originalS3Key: text("original_s3_key").notNull(),
    vocalsS3Key: text("vocals_s3_key"),
    backingS3Key: text("backing_s3_key"),
    bassS3Key: text("bass_s3_key"),
    drumsS3Key: text("drums_s3_key"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("recordings_user_idx").on(t.userId),
    statusIdx: index("recordings_status_idx").on(t.status),
  })
);

// ─── Analyses ────────────────────────────────────────────────────
export const analyses = pgTable(
  "analyses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recordingId: uuid("recording_id")
      .notNull()
      .references(() => recordings.id, { onDelete: "cascade" })
      .unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Transcript
    transcriptText: text("transcript_text"),
    transcriptWords: jsonb("transcript_words").$type<
      { word: string; start: number; end: number; confidence: number }[]
    >(),
    noSpeechDetected: boolean("no_speech_detected").default(false),
    // Acoustic
    acousticFeatures: jsonb("acoustic_features").notNull(),
    f0Frames: jsonb("f0_frames").$type<number[]>(),
    spectrogramS3Key: text("spectrogram_s3_key"),
    // Report
    report: jsonb("report").notNull(),
    archetype: text("archetype").$type<
      "The Driver" | "The Guardian" | "The Seeker" | "The Navigator"
    >(),
    phraseBreakdown: jsonb("phrase_breakdown"),
    phraseBreakdownRequestedAt: timestamp("phrase_breakdown_requested_at", {
      mode: "date",
    }),
    // Meta
    processingMs: integer("processing_ms"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("analyses_user_idx").on(t.userId),
    recordingIdx: index("analyses_recording_idx").on(t.recordingId),
  })
);

// ─── Chat Sessions ────────────────────────────────────────────────
export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  analysisId: uuid("analysis_id")
    .notNull()
    .references(() => analyses.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => chatSessions.id, { onDelete: "cascade" }),
  role: text("role").$type<"user" | "assistant">().notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  recordings: many(recordings),
  analyses: many(analyses),
  chatSessions: many(chatSessions),
}));

export const recordingsRelations = relations(recordings, ({ one }) => ({
  user: one(users, { fields: [recordings.userId], references: [users.id] }),
  analysis: one(analyses, {
    fields: [recordings.id],
    references: [analyses.recordingId],
  }),
}));

export const analysesRelations = relations(analyses, ({ one, many }) => ({
  user: one(users, { fields: [analyses.userId], references: [users.id] }),
  recording: one(recordings, {
    fields: [analyses.recordingId],
    references: [recordings.id],
  }),
  chatSessions: many(chatSessions),
}));

// ─── Schema export ────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Recording = typeof recordings.$inferSelect;
export type NewRecording = typeof recordings.$inferInsert;
export type Analysis = typeof analyses.$inferSelect;
export type NewAnalysis = typeof analyses.$inferInsert;
