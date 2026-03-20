"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/trpc/provider";
import { formatDistanceToNow } from "date-fns";

const ARCHETYPE_COLORS: Record<string, string> = {
  "The Driver": "#f97316",
  "The Guardian": "#7c3aed",
  "The Seeker": "#00e5ff",
  "The Navigator": "#10b981",
};

const STATUS_STYLES: Record<string, string> = {
  complete: "text-green-400 bg-green-950/50 border-green-800",
  error: "text-red-400 bg-red-950/50 border-red-800",
  uploading: "text-yellow-400 bg-yellow-950/50 border-yellow-800",
  separating: "text-blue-400 bg-blue-950/50 border-blue-800",
  transcribing: "text-blue-400 bg-blue-950/50 border-blue-800",
  measuring: "text-purple-400 bg-purple-950/50 border-purple-800",
  diagnosing: "text-purple-400 bg-purple-950/50 border-purple-800",
};

function formatDuration(sec?: number | null) {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AnalysesPage() {
  const router = useRouter();

  const { data: recordings, isLoading, refetch } = api.recordings.list.useQuery({
    limit: 50,
    offset: 0,
  });

  const deleteRecording = api.recordings.delete.useMutation({
    onSuccess: () => refetch(),
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-surface border border-border rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">My Analyses</h1>
          <p className="text-muted mt-1">
            {recordings?.length ?? 0} recording
            {recordings?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/record"
          className="px-5 py-2.5 bg-accent text-bg rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/20"
        >
          + New Recording
        </Link>
      </div>

      {/* Empty state */}
      {!recordings?.length && (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl">
          <div className="text-5xl mb-4">🎙️</div>
          <h2 className="text-xl font-bold mb-2">No recordings yet</h2>
          <p className="text-muted mb-6 max-w-sm mx-auto">
            Record yourself singing and get AI-powered vocal coaching in under 90 seconds.
          </p>
          <Link
            href="/record"
            className="inline-block px-6 py-3 bg-accent text-bg rounded-xl font-bold hover:scale-105 transition-all"
          >
            Start Recording
          </Link>
        </div>
      )}

      {/* Recording list */}
      <div className="space-y-3">
        {recordings?.map((recording) => {
          const analysis = recording.analysis as any;
          const archetype = analysis?.archetype as string | undefined;
          const archetypeColor = archetype ? ARCHETYPE_COLORS[archetype] : undefined;
          const isComplete = recording.status === "complete";
          const isProcessing = !["complete", "error"].includes(recording.status);

          return (
            <div
              key={recording.id}
              className={`group relative border border-border rounded-xl p-4 bg-surface hover:border-accent/30 transition-all ${
                isComplete ? "cursor-pointer" : ""
              }`}
              onClick={() => isComplete && router.push(`/analyses/${recording.id}`)}
            >
              <div className="flex items-center gap-4">
                {/* Archetype badge or status icon */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border text-sm font-bold font-mono"
                  style={{
                    borderColor: archetypeColor
                      ? `${archetypeColor}40`
                      : "var(--border)",
                    background: archetypeColor
                      ? `${archetypeColor}10`
                      : "var(--surface2)",
                    color: archetypeColor ?? "var(--muted)",
                  }}
                >
                  {isProcessing ? (
                    <span className="animate-spin">⟳</span>
                  ) : isComplete ? (
                    archetype ? archetype.split(" ")[1][0] : "✓"
                  ) : (
                    "!"
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold truncate">{recording.title}</h3>
                    {archetype && (
                      <span
                        className="text-xs font-mono px-2 py-0.5 rounded border"
                        style={{
                          color: archetypeColor,
                          borderColor: `${archetypeColor}40`,
                          background: `${archetypeColor}10`,
                        }}
                      >
                        {archetype}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted font-mono">
                    <span>
                      {formatDistanceToNow(new Date(recording.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    <span>•</span>
                    <span>{formatDuration(recording.durationSec)}</span>
                    <span>•</span>
                    <span className="uppercase">{recording.fileFormat}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`text-xs font-mono px-2 py-1 rounded border capitalize ${
                      STATUS_STYLES[recording.status] ?? "text-muted border-border"
                    }`}
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-1">
                        <span className="animate-pulse">●</span>
                        {recording.status}
                      </span>
                    ) : (
                      recording.status
                    )}
                  </span>

                  {isComplete && (
                    <span className="text-muted group-hover:text-accent transition-colors text-lg">
                      →
                    </span>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Delete this recording and its analysis?")) {
                        deleteRecording.mutate({ id: recording.id });
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 transition-all p-1 rounded"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Processing progress bar */}
              {isProcessing && (
                <div className="mt-3 h-0.5 bg-surface2 rounded-full overflow-hidden">
                  <div className="h-full bg-accent/50 rounded-full w-1/2 animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
