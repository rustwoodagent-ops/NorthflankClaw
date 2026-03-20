"use client";

import { useState } from "react";
import type { VocalReport, AcousticFeatures } from "@voxai/shared/types";
import { PitchChart } from "@/components/visualizations/PitchChart";

const PILLAR_KEYS = [
  { key: "breathSupport", label: "Breath & Support", icon: "💨", color: "#00e5ff" },
  { key: "phonation", label: "Phonation", icon: "🎵", color: "#7c3aed" },
  { key: "passaggio", label: "The Passaggio", icon: "🌉", color: "#f97316" },
  { key: "vowelModification", label: "Vowel Modification", icon: "👄", color: "#10b981" },
  { key: "resonance", label: "Resonance", icon: "🔊", color: "#f59e0b" },
  { key: "tensionPatterns", label: "Tension Patterns", icon: "⚡", color: "#ef4444" },
  { key: "expressionPhrasing", label: "Expression & Phrasing", icon: "🎭", color: "#ec4899" },
] as const;

const ARCHETYPE_COLORS = {
  "The Driver": "#f97316",
  "The Guardian": "#7c3aed",
  "The Seeker": "#00e5ff",
  "The Navigator": "#10b981",
};

const EVIDENCE_COLORS = {
  MEASURED: "text-green-400 bg-green-950/50 border-green-800",
  INFERRED: "text-yellow-400 bg-yellow-950/50 border-yellow-800",
  UNVERIFIABLE: "text-purple-400 bg-purple-950/50 border-purple-800",
};

interface VocalReportProps {
  report: VocalReport;
  acousticFeatures: AcousticFeatures;
  transcriptText?: string;
  transcriptWords?: { word: string; start: number; end: number }[];
  f0Frames?: number[];
  durationSec?: number;
  spectrogramUrl?: string | null;
  onRequestPhraseBreakdown?: () => void;
  phraseBreakdownLoading?: boolean;
}

export function VocalReportView({
  report,
  acousticFeatures: f,
  transcriptText,
  transcriptWords = [],
  f0Frames = [],
  durationSec = 0,
  spectrogramUrl,
  onRequestPhraseBreakdown,
  phraseBreakdownLoading,
}: VocalReportProps) {
  const [openPillar, setOpenPillar] = useState<string | null>("breathSupport");
  const archetypeColor = ARCHETYPE_COLORS[report.archetype] || "#00e5ff";

  return (
    <div className="space-y-10 pb-20">

      {/* ── Archetype Card ─────────────────────────────────────── */}
      <div
        className="rounded-xl border p-6 relative overflow-hidden"
        style={{ borderColor: `${archetypeColor}40`, background: `${archetypeColor}08` }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: archetypeColor }}
        />
        <div className="flex items-start gap-4">
          <div
            className="text-4xl font-black font-mono leading-none"
            style={{ color: archetypeColor }}
          >
            {report.archetype.split(" ")[1].charAt(0)}
          </div>
          <div>
            <div className="text-xs font-mono text-muted tracking-widest uppercase mb-1">
              Vocal Archetype
            </div>
            <h2 className="text-2xl font-bold" style={{ color: archetypeColor }}>
              {report.archetype}
            </h2>
            <p className="text-muted mt-1 leading-relaxed">{report.archetypeDescription}</p>
            <p className="text-text mt-2 italic">"{report.overallImpression}"</p>
          </div>
        </div>
      </div>

      {/* ── What You Did Well ──────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>✨</span> What You Did Well
        </h3>
        <div className="grid gap-3">
          {report.strengthsList.map((s, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 bg-surface border border-border rounded-lg"
            >
              <span className="text-green-400 font-bold flex-shrink-0">{i + 1}.</span>
              <p className="text-text leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Acoustic Feature Summary ───────────────────────────── */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>📊</span> Acoustic Measurements
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: "Mean Pitch", value: `${f.meanF0.toFixed(1)} Hz`, flag: false },
            { label: "Pitch Range", value: `${f.f0Range.toFixed(1)} Hz`, flag: false },
            {
              label: "Jitter",
              value: `${f.jitterPct.toFixed(2)}%`,
              flag: f.jitterPct > 1.04,
              good: f.jitterPct < 1.04,
            },
            {
              label: "Shimmer",
              value: `${f.shimmerPct.toFixed(2)}%`,
              flag: f.shimmerPct > 3.81,
              good: f.shimmerPct < 3.81,
            },
            {
              label: "HPR",
              value: `${f.hprDb.toFixed(1)} dB`,
              flag: f.hprDb < 0,
              good: f.hprDb > 2,
            },
            {
              label: "Dynamic Range",
              value: `${f.dynamicRangeDb.toFixed(1)} dB`,
              flag: f.dynamicRangeDb < 6,
              good: f.dynamicRangeDb > 12,
            },
            {
              label: "Spectral Flatness",
              value: `${f.spectralFlatness.toFixed(1)} dB`,
              flag: f.spectralFlatness > -20,
              good: f.spectralFlatness < -25,
            },
            {
              label: "Voiced",
              value: `${(f.voicedFraction * 100).toFixed(0)}%`,
              flag: f.voicedFraction < 0.5,
              good: f.voicedFraction > 0.7,
            },
          ].map((m) => (
            <div
              key={m.label}
              className={`p-3 rounded-lg border ${
                m.flag
                  ? "border-red-800 bg-red-950/30"
                  : m.good
                  ? "border-green-800 bg-green-950/20"
                  : "border-border bg-surface"
              }`}
            >
              <div className="text-xs font-mono text-muted mb-1">{m.label}</div>
              <div
                className={`text-lg font-bold font-mono ${
                  m.flag ? "text-red-400" : m.good ? "text-green-400" : "text-text"
                }`}
              >
                {m.value}
              </div>
              {m.flag && <div className="text-xs text-red-400 mt-1">⚠ Elevated</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Pitch Timeline ─────────────────────────────────────── */}
      {f0Frames.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>📈</span> Pitch Timeline
          </h3>
          <div className="bg-surface border border-border rounded-lg p-4">
            <PitchChart
              f0Frames={f0Frames}
              durationSec={durationSec}
              transcriptWords={transcriptWords.slice(0, 20)}
            />
          </div>
        </div>
      )}

      {/* ── Spectrogram ────────────────────────────────────────── */}
      {spectrogramUrl && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🎨</span> Mel Spectrogram
          </h3>
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <img
              src={spectrogramUrl}
              alt="Mel spectrogram"
              className="w-full"
              loading="lazy"
            />
          </div>
          <p className="text-xs text-muted mt-2">
            Cyan line = fundamental frequency (F0). Warmer colors = more energy.
          </p>
        </div>
      )}

      {/* ── Transcript ────────────────────────────────────────── */}
      {transcriptText && (
        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
            <span>📝</span> Transcript
          </h3>
          <div className="bg-surface border border-border rounded-lg p-4 text-muted italic leading-relaxed">
            "{transcriptText}"
          </div>
        </div>
      )}

      {/* ── Seven Pillars ─────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>📊</span> The Seven Pillars Analysis
        </h3>
        <div className="space-y-2">
          {PILLAR_KEYS.map(({ key, label, icon, color }) => {
            const pillar = report.pillars[key as keyof typeof report.pillars];
            const isOpen = openPillar === key;

            return (
              <div
                key={key}
                className="rounded-lg border overflow-hidden transition-colors"
                style={{
                  borderColor: isOpen ? `${color}40` : "#1e2535",
                  background: isOpen ? `${color}05` : "transparent",
                }}
              >
                <button
                  onClick={() => setOpenPillar(isOpen ? null : key)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-xl flex-shrink-0">{icon}</span>
                  <span className="font-semibold flex-1">{label}</span>
                  <span
                    className="text-xs font-mono px-2 py-1 rounded border"
                    style={{ color, borderColor: `${color}40`, background: `${color}10` }}
                  >
                    PILLAR {PILLAR_KEYS.findIndex((p) => p.key === key) + 1}
                  </span>
                  <span className="text-muted">{isOpen ? "▲" : "▼"}</span>
                </button>

                {isOpen && pillar && (
                  <div className="px-4 pb-4 space-y-4">
                    <div
                      className="h-px"
                      style={{ background: `${color}20` }}
                    />

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <div className="text-xs font-mono text-muted tracking-widest">WHAT I HEAR</div>
                        <p className="text-sm text-text leading-relaxed">{pillar.whatIHear}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-mono text-muted tracking-widest">WHAT'S WORKING</div>
                        <p className="text-sm text-green-300 leading-relaxed">{pillar.whatsWorking}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-mono text-muted tracking-widest">AREA FOR GROWTH</div>
                        <p className="text-sm text-yellow-300 leading-relaxed">{pillar.areaForGrowth}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted">Evidence:</span>
                      <span
                        className={`text-xs font-mono px-2 py-0.5 rounded border ${
                          EVIDENCE_COLORS[pillar.evidenceTag]
                        }`}
                      >
                        [{pillar.evidenceTag}]
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Priority Areas ────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>🎯</span> Top Priority Areas
        </h3>
        <div className="space-y-4">
          {report.priorityAreas.map((area, i) => (
            <div
              key={i}
              className="border border-border rounded-xl p-5 space-y-4 bg-surface"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent font-bold text-sm">
                  {i + 1}
                </div>
                <h4 className="font-bold text-lg">{area.title}</h4>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-xs font-mono text-muted mb-1">WHAT I HEAR</div>
                  <p className="text-text leading-relaxed">{area.whatIHear}</p>
                </div>
                <div>
                  <div className="text-xs font-mono text-muted mb-1">WHY IT MATTERS</div>
                  <p className="text-text leading-relaxed">{area.whyItMatters}</p>
                </div>
                <div>
                  <div className="text-xs font-mono text-muted mb-1">HOW TO ADDRESS</div>
                  <p className="text-accent leading-relaxed">{area.howToAddress}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Prescribed Exercises ──────────────────────────────── */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>💪</span> Prescribed Exercises
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {report.prescribedExercises.map((ex, i) => (
            <div
              key={i}
              className="border border-border rounded-xl p-5 space-y-4 bg-surface"
            >
              <div>
                <div className="text-xs font-mono text-muted mb-1">{ex.pillar}</div>
                <h4 className="font-bold text-lg">{ex.name}</h4>
                <p className="text-muted text-sm mt-1">{ex.purpose}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Starting Pitch", value: ex.startingPitch },
                  { label: "Range", value: ex.range },
                  { label: "Tempo", value: ex.tempo },
                  { label: "Reps", value: ex.repetitions },
                ].map((d) => (
                  <div key={d.label}>
                    <div className="text-xs font-mono text-muted">{d.label}</div>
                    <div className="text-text font-medium">{d.value}</div>
                  </div>
                ))}
              </div>

              <div>
                <div className="text-xs font-mono text-muted mb-2">INSTRUCTIONS</div>
                <ol className="space-y-1">
                  {ex.instructions.map((step, j) => (
                    <li key={j} className="flex gap-2 text-sm text-text">
                      <span className="text-accent font-bold flex-shrink-0">{j + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm border-t border-border pt-3">
                <div>
                  <div className="text-xs font-mono text-muted mb-1">WHAT TO FEEL</div>
                  <p className="text-text">{ex.whatToFeel}</p>
                </div>
                <div>
                  <div className="text-xs font-mono text-muted mb-1">WHAT TO LISTEN FOR</div>
                  <p className="text-accent">{ex.whatToListenFor}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Progress Pathway ──────────────────────────────────── */}
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 space-y-5">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span>🗺️</span> Progress Pathway
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-xs font-mono text-muted mb-2">
              DAILY PRACTICE FOCUS ({report.progressPathway.dailyFocusMinutes} MIN)
            </div>
            <ol className="space-y-2">
              {report.progressPathway.dailyFocusTasks.map((t, i) => (
                <li key={i} className="flex gap-2 text-sm text-text">
                  <span className="text-accent">→</span> {t}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <div className="text-xs font-mono text-muted mb-2">LISTEN FOR THESE SIGNS</div>
            <ul className="space-y-2">
              {report.progressPathway.whatToListenFor.map((l, i) => (
                <li key={i} className="flex gap-2 text-sm text-green-300">
                  <span>✓</span> {l}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-accent/20 pt-4 grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-mono text-muted mb-1">GOAL OF NEXT TAKE</div>
            <p className="text-text font-medium">{report.progressPathway.goalOfNextTake}</p>
          </div>
          <div>
            <div className="text-xs font-mono text-muted mb-1">WHEN TO RE-RECORD</div>
            <p className="text-text">{report.progressPathway.whenToReRecord}</p>
          </div>
        </div>
      </div>

      {/* ── Phrase Breakdown ──────────────────────────────────── */}
      {onRequestPhraseBreakdown && (
        <div className="border border-dashed border-border rounded-xl p-6 text-center space-y-3">
          <h3 className="font-bold text-lg">Want More Detail?</h3>
          <p className="text-muted text-sm max-w-md mx-auto">
            Get a phrase-by-phrase breakdown analysing each lyric section individually —
            pitch accuracy, vowel shapes, resonance, and one specific improvement per phrase.
          </p>
          <button
            onClick={onRequestPhraseBreakdown}
            disabled={phraseBreakdownLoading}
            className="px-6 py-3 bg-accent/10 border border-accent/40 text-accent rounded-lg font-medium hover:bg-accent/20 transition-colors disabled:opacity-50"
          >
            {phraseBreakdownLoading ? "Analysing phrases..." : "Request Phrase-by-Phrase Breakdown"}
          </button>
        </div>
      )}

      {/* ── Limitations ───────────────────────────────────────── */}
      <div className="text-xs text-muted space-y-2 border-t border-border pt-6">
        <p className="font-semibold text-muted">Limitations & Caveats</p>
        <p>Acoustic analysis is not a substitute for assessment by a qualified voice specialist or speech-language pathologist. Room noise, microphone quality, and recording distance affect measured values. [INFERRED] and [UNVERIFIABLE] conclusions require corroboration from perceptual assessment. Reference ranges are population averages and do not account for individual variation, age, accent, or vocal training history.</p>
      </div>
    </div>
  );
}
