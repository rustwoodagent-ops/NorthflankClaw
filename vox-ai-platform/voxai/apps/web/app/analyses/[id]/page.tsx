"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/trpc/provider";
import { VocalReportView } from "@/components/report/VocalReportView";
import type { VocalReport, AcousticFeatures } from "@voxai/shared/types";

export default function AnalysisPage() {
  const params = useParams();
  const recordingId = params.id as string;

  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = api.analyses.get.useQuery({ recordingId });

  const requestBreakdown = api.analyses.requestPhraseBreakdown.useMutation();
  const sendChat = api.analyses.chat.useMutation({
    onSuccess: ({ reply }) => {
      setChatHistory((h) => [...h, { role: "assistant", content: reply }]);
    },
  });

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 bg-surface border border-border rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">Analysis not found</h1>
        <p className="text-muted">
          {error?.message ?? "This analysis doesn't exist or you don't have access to it."}
        </p>
      </div>
    );
  }

  const { analysis, spectrogramUrl } = data;
  const report = analysis.report as unknown as VocalReport;
  const features = analysis.acousticFeatures as unknown as AcousticFeatures;
  const f0Frames = (analysis.f0Frames as number[] | null) ?? [];
  const transcriptWords = analysis.transcriptWords ?? [];
  const analysisId = analysis.id;

  const handleSendChat = async () => {
    const msg = chatInput.trim();
    if (!msg || sendChat.isPending) return;
    setChatInput("");
    setChatHistory((h) => [...h, { role: "user", content: msg }]);
    await sendChat.mutateAsync({
      analysisId,
      message: msg,
      history: chatHistory,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <div className="text-xs font-mono text-muted mb-1">
            {new Date(analysis.createdAt).toLocaleDateString("en-AU", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <h1 className="text-3xl font-black">
            {analysis.recording?.title ?? "Vocal Analysis"}
          </h1>
          {analysis.recording?.durationSec && (
            <p className="text-muted text-sm mt-1 font-mono">
              {Math.floor(analysis.recording.durationSec / 60)}:
              {Math.floor(analysis.recording.durationSec % 60)
                .toString()
                .padStart(2, "0")}{" "}
              · Processed in{" "}
              {analysis.processingMs
                ? `${(analysis.processingMs / 1000).toFixed(1)}s`
                : "—"}
            </p>
          )}
        </div>

        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`flex-shrink-0 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
            chatOpen
              ? "bg-accent/10 border-accent/40 text-accent"
              : "border-border text-muted hover:border-accent/30 hover:text-text"
          }`}
        >
          💬 Ask Howard
        </button>
      </div>

      {/* Chat panel */}
      {chatOpen && (
        <div className="mb-8 border border-border rounded-xl bg-surface overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface2">
            <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-xs font-bold">
              H
            </div>
            <span className="text-sm font-semibold">Howard — Your AI Vocal Coach</span>
            <span className="text-xs text-muted ml-auto">
              Ask any follow-up questions about this analysis
            </span>
          </div>

          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {chatHistory.length === 0 && (
              <div className="text-muted text-sm text-center py-8">
                Ask Howard anything about your analysis...
                <br />
                <span className="text-xs">
                  e.g. "What does elevated jitter mean for my voice?" or "Can you explain the passaggio observation?"
                </span>
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-lg rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-accent/10 border border-accent/30 text-text"
                      : "bg-surface2 border border-border text-text"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {sendChat.isPending && (
              <div className="flex gap-2 justify-start">
                <div className="bg-surface2 border border-border rounded-xl px-4 py-2.5 text-muted text-sm">
                  Howard is thinking
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          <div className="flex gap-2 p-3 border-t border-border">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendChat()}
              placeholder="Ask about your analysis..."
              className="flex-1 px-4 py-2 bg-surface2 border border-border rounded-lg text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors"
            />
            <button
              onClick={handleSendChat}
              disabled={!chatInput.trim() || sendChat.isPending}
              className="px-4 py-2 bg-accent text-bg rounded-lg text-sm font-bold disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Main report */}
      <VocalReportView
        report={report}
        acousticFeatures={features}
        transcriptText={analysis.transcriptText ?? undefined}
        transcriptWords={transcriptWords as any[]}
        f0Frames={f0Frames}
        durationSec={analysis.recording?.durationSec ?? 0}
        spectrogramUrl={spectrogramUrl}
        onRequestPhraseBreakdown={
          !analysis.phraseBreakdown
            ? () => requestBreakdown.mutate({ analysisId })
            : undefined
        }
        phraseBreakdownLoading={requestBreakdown.isPending}
      />

      {/* Phrase Breakdown Results */}
      {(analysis.phraseBreakdown || requestBreakdown.data) && (
        <div className="mt-10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🔬</span> Phrase-by-Phrase Breakdown
          </h3>
          <div className="space-y-4">
            {((requestBreakdown.data?.breakdown as any)?.phrases ??
              (analysis.phraseBreakdown as any)?.phrases ??
              []
            ).map((phrase: any, i: number) => (
              <div
                key={i}
                className="border border-border rounded-xl p-5 bg-surface space-y-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted bg-surface2 border border-border px-2 py-1 rounded">
                    {phrase.timeRange}
                  </span>
                  <span className="text-text font-medium italic">"{phrase.lyrics}"</span>
                </div>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  {[
                    { label: "Breath & Support", value: phrase.breathSupport },
                    { label: "Pitch & Intonation", value: phrase.pitchIntonation },
                    { label: "Vowel Shapes", value: phrase.vowelShapes },
                    { label: "Resonance & Tone", value: phrase.resonanceTone },
                    { label: "Tension", value: phrase.tensionObservations },
                    { label: "Emotional Delivery", value: phrase.emotionalDelivery },
                  ].map((item) => item.value && (
                    <div key={item.label}>
                      <div className="text-xs font-mono text-muted mb-0.5">{item.label}</div>
                      <p className="text-muted leading-relaxed">{item.value}</p>
                    </div>
                  ))}
                </div>
                {phrase.passaggioNavigation && (
                  <div className="border-l-2 border-accent3/50 pl-3">
                    <div className="text-xs font-mono text-accent3 mb-0.5">PASSAGGIO</div>
                    <p className="text-sm text-text">{phrase.passaggioNavigation}</p>
                  </div>
                )}
                <div className="border-t border-border pt-3">
                  <div className="text-xs font-mono text-accent mb-1">ONE SPECIFIC IMPROVEMENT</div>
                  <p className="text-text font-medium">{phrase.oneSpecificImprovement}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
