"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRecorder } from "@/lib/hooks/useRecorder";
import { useUpload } from "@/lib/hooks/useUpload";
import { useJobProgress } from "@/lib/hooks/useJobProgress";
import { LiveWaveform } from "@/components/visualizations/LiveWaveform";
import { ProcessingStatus } from "./ProcessingStatus";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function RecordingStudio() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [showTitleInput, setShowTitleInput] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const {
    state: recorderState,
    duration,
    waveformData,
    audioBlob,
    error: recordingError,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  } = useRecorder();

  const {
    uploadState,
    uploadProgress,
    recordingId,
    uploadError,
    uploadRecording,
  } = useUpload();

  const jobProgress = useJobProgress(
    uploadState === "queued" || uploadState === "confirming" ? recordingId : null
  );

  // Auto-navigate when analysis complete
  useEffect(() => {
    if (jobProgress.stage === "complete" && recordingId) {
      setTimeout(() => {
        router.push(`/analyses/${recordingId}`);
      }, 1500);
    }
  }, [jobProgress.stage, recordingId, router]);

  const handleStopAndAnalyse = async () => {
    stopRecording();
    setShowTitleInput(true);
    setTimeout(() => titleInputRef.current?.focus(), 100);
  };

  const handleSubmit = async () => {
    if (!audioBlob) return;
    setShowTitleInput(false);
    await uploadRecording(audioBlob, duration, title || undefined);
  };

  const isProcessing =
    uploadState === "uploading" ||
    uploadState === "confirming" ||
    uploadState === "queued";

  const currentError = recordingError || uploadError;

  // ── Idle / Recording view ──────────────────────────────────────
  if (!isProcessing && jobProgress.stage === "idle") {
    return (
      <div className="flex flex-col items-center gap-8">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            {recorderState === "recording"
              ? "Recording..."
              : recorderState === "paused"
              ? "Paused"
              : recorderState === "processing"
              ? "Ready to analyse"
              : "Start Recording"}
          </h1>
          <p className="text-muted">
            {recorderState === "idle"
              ? "Press the button below to begin. Sing naturally."
              : recorderState === "recording"
              ? "Sing your song. Press stop when you're done."
              : recorderState === "processing"
              ? "Great take! Give it a title and submit for analysis."
              : ""}
          </p>
        </div>

        {/* Waveform */}
        <div
          className="w-full max-w-2xl rounded-lg border border-border bg-surface overflow-hidden"
          style={{ minHeight: 100 }}
        >
          <LiveWaveform
            data={waveformData}
            isRecording={recorderState === "recording"}
            height={100}
          />
        </div>

        {/* Timer */}
        <div
          className="font-mono text-5xl font-bold tracking-widest"
          style={{
            color: recorderState === "recording" ? "#00e5ff" : "#475569",
          }}
        >
          {formatTime(duration)}
        </div>

        {/* Error */}
        {currentError && (
          <div className="w-full max-w-md p-4 bg-red-950/50 border border-red-800 rounded-lg text-red-300 text-sm">
            {currentError}
          </div>
        )}

        {/* Title input (after stop) */}
        {showTitleInput && recorderState === "processing" && (
          <div className="w-full max-w-md space-y-3">
            <label className="text-sm text-muted font-medium">
              Song title (optional)
            </label>
            <input
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="e.g. That's My Flavour"
              className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-4">
          {recorderState === "idle" && (
            <button
              onClick={startRecording}
              className="w-20 h-20 rounded-full bg-accent text-bg font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/30 flex items-center justify-center"
            >
              <span className="text-3xl">●</span>
            </button>
          )}

          {recorderState === "recording" && (
            <>
              <button
                onClick={pauseRecording}
                className="w-14 h-14 rounded-full bg-surface border border-border text-muted hover:border-accent hover:text-accent transition-all flex items-center justify-center"
              >
                <span className="text-xl">⏸</span>
              </button>
              <button
                onClick={handleStopAndAnalyse}
                className="w-20 h-20 rounded-full bg-red-500 text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-500/30 flex items-center justify-center"
              >
                <span className="text-3xl">■</span>
              </button>
            </>
          )}

          {recorderState === "paused" && (
            <>
              <button
                onClick={resumeRecording}
                className="w-14 h-14 rounded-full bg-surface border border-border text-muted hover:border-accent hover:text-accent transition-all flex items-center justify-center"
              >
                <span className="text-xl">▶</span>
              </button>
              <button
                onClick={handleStopAndAnalyse}
                className="w-20 h-20 rounded-full bg-red-500 text-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
              >
                <span className="text-3xl">■</span>
              </button>
            </>
          )}

          {recorderState === "processing" && showTitleInput && (
            <>
              <button
                onClick={resetRecording}
                className="px-6 py-3 rounded-lg bg-surface border border-border text-muted hover:border-red-500 hover:text-red-400 transition-all text-sm font-medium"
              >
                Discard
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 rounded-lg bg-accent text-bg font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/20"
              >
                Analyse →
              </button>
            </>
          )}
        </div>

        {/* Duration warning */}
        {duration > 0 && duration < 3 && recorderState !== "recording" && (
          <p className="text-yellow-500 text-sm text-center">
            Recording is very short ({duration}s). For best results, record at least 15 seconds.
          </p>
        )}
      </div>
    );
  }

  // ── Processing view ────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto">
      <ProcessingStatus
        stage={
          uploadState === "uploading"
            ? "uploading"
            : jobProgress.stage !== "idle"
            ? jobProgress.stage
            : "uploading"
        }
        progress={
          uploadState === "uploading"
            ? uploadProgress
            : jobProgress.progress
        }
        message={
          uploadState === "uploading"
            ? `Uploading... ${uploadProgress}%`
            : jobProgress.message
        }
        error={uploadError || jobProgress.error}
      />

      {jobProgress.stage !== "complete" && (
        <p className="text-sm text-muted text-center max-w-xs">
          This typically takes 45–90 seconds. You can navigate away — we'll email you when it's ready.
        </p>
      )}
    </div>
  );
}
