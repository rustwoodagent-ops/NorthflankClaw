"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type ProcessingStage =
  | "idle"
  | "uploading"
  | "separating"
  | "transcribing"
  | "measuring"
  | "diagnosing"
  | "complete"
  | "error";

export interface ProgressState {
  stage: ProcessingStage;
  progress: number;
  message: string;
  error?: string;
}

export const STAGE_LABELS: Record<ProcessingStage, string> = {
  idle: "Ready",
  uploading: "Uploading recording...",
  separating: "Separating vocals from backing track...",
  transcribing: "Transcribing lyrics...",
  measuring: "Extracting acoustic features...",
  diagnosing: "Generating coaching report...",
  complete: "Analysis complete!",
  error: "Processing failed",
};

export const STAGE_ORDER: ProcessingStage[] = [
  "uploading",
  "separating",
  "transcribing",
  "measuring",
  "diagnosing",
  "complete",
];

export function useJobProgress(recordingId: string | null): ProgressState {
  const [progress, setProgress] = useState<ProgressState>({
    stage: "idle",
    progress: 0,
    message: "",
  });
  const esRef = useRef<EventSource | null>(null);

  const connect = useCallback((id: string) => {
    if (esRef.current) {
      esRef.current.close();
    }

    const es = new EventSource(`/api/jobs/${id}/progress`);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setProgress({
          stage: data.stage as ProcessingStage,
          progress: data.progress ?? 0,
          message: data.message ?? "",
          error: data.error,
        });

        if (data.stage === "complete" || data.stage === "error") {
          es.close();
          esRef.current = null;
        }
      } catch {
        // Ignore parse errors (heartbeat comments come through as empty)
      }
    };

    es.onerror = () => {
      // SSE will auto-reconnect — only close on terminal states
    };

    return es;
  }, []);

  useEffect(() => {
    if (!recordingId) return;

    const es = connect(recordingId);

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [recordingId, connect]);

  return progress;
}
