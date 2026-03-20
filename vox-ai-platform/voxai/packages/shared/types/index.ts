// ─── Recordings ────────────────────────────────────────────────
export type RecordingStatus =
  | "uploading"
  | "separating"
  | "transcribing"
  | "measuring"
  | "diagnosing"
  | "complete"
  | "error";

export interface Recording {
  id: string;
  userId: string;
  title: string;
  status: RecordingStatus;
  durationSec: number | null;
  fileFormat: string;
  originalS3Key: string;
  vocalsS3Key: string | null;
  backingS3Key: string | null;
  createdAt: Date;
}

// ─── Acoustic Features ──────────────────────────────────────────
export interface AcousticFeatures {
  // Pitch
  meanF0: number;
  f0Std: number;
  f0Range: number;
  voicedFraction: number;
  // Perturbation
  jitterPct: number;
  shimmerPct: number;
  // Energy
  meanRms: number;
  rmsStd: number;
  dynamicRangeDb: number;
  // Spectral
  meanZcr: number;
  spectralCentroid: number;
  spectralFlatness: number;
  spectralRolloff: number;
  // Harmonic
  hprDb: number;
  // Timbre
  mfccMeans: number[];
  mfccStds: number[];
  // Diagnostic flags (rules engine)
  diagnosticFlags: DiagnosticFlags;
  // Normative comparisons
  normativeComparisons: NormativeComparison[];
}

export interface DiagnosticFlags {
  jitterElevated: boolean;
  shimmerElevated: boolean;
  lowDynamicRange: boolean;
  highSpectralFlatness: boolean;
  lowVoicedFraction: boolean;
  highZcr: boolean;
}

export interface NormativeComparison {
  feature: string;
  value: number;
  unit: string;
  norm: string;
  withinNorm: boolean;
  evidenceTag: "MEASURED" | "INFERRED" | "UNVERIFIABLE";
}

// ─── Transcript ─────────────────────────────────────────────────
export interface TranscriptWord {
  word: string;
  start: number; // seconds
  end: number;
  confidence: number;
}

export interface Transcript {
  text: string;
  words: TranscriptWord[];
  noSpeechDetected: boolean;
}

// ─── Report / Coaching ──────────────────────────────────────────
export type VocalArchetype =
  | "The Driver"
  | "The Guardian"
  | "The Seeker"
  | "The Navigator";

export type EvidenceTag = "MEASURED" | "INFERRED" | "UNVERIFIABLE";

export interface PillarObservation {
  whatIHear: string;
  whatsWorking: string;
  areaForGrowth: string;
  evidenceTag: EvidenceTag;
  specificTimestamps?: string[];
}

export interface PriorityArea {
  title: string;
  pillar: string;
  whatIHear: string;
  whyItMatters: string;
  howToAddress: string;
  exerciseIds: string[];
}

export interface Exercise {
  id: string;
  name: string;
  pillar: string;
  purpose: string;
  instructions: string[];
  startingPitch: string;
  range: string;
  tempo: string;
  repetitions: string;
  whatToFeel: string;
  whatToListenFor: string;
  voiceTypes: string[]; // "all" | "male" | "female"
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface ProgressPathway {
  dailyFocusMinutes: number;
  dailyFocusTasks: string[];
  whatToListenFor: string[];
  goalOfNextTake: string;
  whenToReRecord: string;
}

export interface PhraseAnalysis {
  timeRange: string;
  lyrics: string;
  breathSupport: string;
  pitchIntonation: string;
  passaggioNavigation: string | null;
  vowelShapes: string;
  resonanceTone: string;
  tensionObservations: string;
  emotionalDelivery: string;
  oneSpecificImprovement: string;
}

export interface VocalReport {
  archetype: VocalArchetype;
  archetypeDescription: string;
  overallImpression: string;
  strengthsList: string[];
  pillars: {
    breathSupport: PillarObservation;
    phonation: PillarObservation;
    passaggio: PillarObservation;
    vowelModification: PillarObservation;
    resonance: PillarObservation;
    tensionPatterns: PillarObservation;
    expressionPhrasing: PillarObservation;
  };
  priorityAreas: PriorityArea[];
  prescribedExercises: Exercise[];
  progressPathway: ProgressPathway;
  phraseBreakdown?: PhraseAnalysis[];
  generatedAt: Date;
}

// ─── Analysis (full DB record) ──────────────────────────────────
export interface Analysis {
  id: string;
  recordingId: string;
  userId: string;
  transcript: Transcript;
  acousticFeatures: AcousticFeatures;
  f0Frames: number[]; // frame-by-frame pitch values (NaN = unvoiced)
  spectrogramS3Key: string | null;
  report: VocalReport;
  processingMs: number;
  createdAt: Date;
}

// ─── Job Progress ────────────────────────────────────────────────
export interface JobProgressEvent {
  jobId: string;
  stage: RecordingStatus;
  progress: number; // 0–100
  message: string;
  error?: string;
}

// ─── Subscriptions ───────────────────────────────────────────────
export type SubscriptionTier = "free" | "basic" | "pro";

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  priceAud: number;
  analysesPerMonth: number;
  features: string[];
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    tier: "free",
    name: "Free",
    priceAud: 0,
    analysesPerMonth: 3,
    features: [
      "3 analyses per month",
      "Full Seven Pillars report",
      "Acoustic feature breakdown",
      "Prescribed exercises",
    ],
  },
  basic: {
    tier: "basic",
    name: "Basic",
    priceAud: 5,
    analysesPerMonth: 10,
    features: [
      "10 analyses per month",
      "Full Seven Pillars report",
      "Pitch timeline visualization",
      "Phrase-by-phrase breakdown",
      "Stems playback",
    ],
  },
  pro: {
    tier: "pro",
    name: "Pro",
    priceAud: 12,
    analysesPerMonth: 50,
    features: [
      "50 analyses per month",
      "Everything in Basic",
      "Mel spectrogram",
      "Piano roll view",
      "Progress tracking over time",
      "Priority processing",
    ],
  },
};
