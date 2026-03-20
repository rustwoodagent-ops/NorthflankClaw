"use client";

import { useEffect, useState } from "react";
import { STAGE_LABELS, STAGE_ORDER, type ProcessingStage } from "@/lib/hooks/useJobProgress";

interface ProcessingStatusProps {
  stage: ProcessingStage;
  progress: number;
  message: string;
  error?: string;
}

const STAGE_ICONS: Record<ProcessingStage, string> = {
  idle: "○",
  uploading: "↑",
  separating: "⊗",
  transcribing: "≡",
  measuring: "◈",
  diagnosing: "◎",
  complete: "✓",
  error: "✕",
};

export function ProcessingStatus({ stage, progress, message, error }: ProcessingStatusProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (stage === "complete" || stage === "error" || stage === "idle") return;
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 500);
    return () => clearInterval(id);
  }, [stage]);

  const currentIdx = STAGE_ORDER.indexOf(stage);

  return (
    <div className="space-y-6">
      {/* Main status */}
      <div className="text-center">
        <div
          className={`text-5xl mb-4 transition-all duration-500 ${
            stage === "complete"
              ? "text-green-400"
              : stage === "error"
              ? "text-red-400"
              : "text-accent animate-pulse"
          }`}
        >
          {STAGE_ICONS[stage]}
        </div>
        <p className="text-lg font-semibold text-text">
          {error || STAGE_LABELS[stage]}
          {!error && stage !== "complete" && stage !== "idle" && (
            <span className="text-muted">{dots}</span>
          )}
        </p>
        {message && !error && stage !== "complete" && (
          <p className="text-sm text-muted mt-1">{message}</p>
        )}
      </div>

      {/* Stage pipeline */}
      <div className="flex items-center gap-0">
        {STAGE_ORDER.filter((s) => s !== "complete").map((s, i) => {
          const idx = STAGE_ORDER.indexOf(s);
          const isDone = currentIdx > idx || stage === "complete";
          const isActive = s === stage;

          return (
            <div key={s} className="flex items-center flex-1">
              {/* Stage node */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                    isDone
                      ? "border-green-500 bg-green-500/20 text-green-400"
                      : isActive
                      ? "border-accent bg-accent/20 text-accent animate-pulse"
                      : "border-border bg-surface text-muted"
                  }`}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                <span className="text-[9px] text-muted font-mono text-center w-14 leading-tight">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </span>
              </div>
              {/* Connector */}
              {i < STAGE_ORDER.filter((s) => s !== "complete").length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 transition-all duration-700 ${
                    isDone ? "bg-green-500/50" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      {stage !== "idle" && stage !== "complete" && stage !== "error" && (
        <div className="h-1 bg-surface2 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
