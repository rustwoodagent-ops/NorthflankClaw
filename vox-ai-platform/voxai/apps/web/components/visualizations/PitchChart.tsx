"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";

interface PitchChartProps {
  f0Frames: (number | null)[];
  durationSec: number;
  transcriptWords?: { word: string; start: number; end: number }[];
}

// Convert Hz to nearest note name
function hzToNote(hz: number): string {
  if (hz <= 0) return "";
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const semitones = Math.round(12 * Math.log2(hz / 440) + 69);
  const octave = Math.floor(semitones / 12) - 1;
  const note = noteNames[((semitones % 12) + 12) % 12];
  return `${note}${octave}`;
}

const HOP_DURATION = 512 / 22050; // seconds per frame

export function PitchChart({ f0Frames, durationSec, transcriptWords = [] }: PitchChartProps) {
  const chartData = useMemo(() => {
    // Downsample to max 500 points for performance
    const targetPoints = Math.min(500, f0Frames.length);
    const step = Math.ceil(f0Frames.length / targetPoints);

    return f0Frames
      .filter((_, i) => i % step === 0)
      .map((hz, i) => ({
        time: Math.round(i * step * HOP_DURATION * 10) / 10,
        hz: hz && hz > 0 ? Math.round(hz * 10) / 10 : null,
        note: hz && hz > 0 ? hzToNote(hz) : null,
      }))
      .filter((d) => d.time <= durationSec);
  }, [f0Frames, durationSec]);

  const validHz = chartData.filter((d) => d.hz !== null).map((d) => d.hz as number);
  const minHz = validHz.length ? Math.max(0, Math.min(...validHz) - 20) : 80;
  const maxHz = validHz.length ? Math.max(...validHz) + 20 : 400;

  // Key note reference lines
  const noteLines = [
    { hz: 261.6, label: "C4 (middle C)" },
    { hz: 329.6, label: "E4" },
    { hz: 392.0, label: "G4" },
    { hz: 440.0, label: "A4" },
    { hz: 523.3, label: "C5" },
  ].filter((n) => n.hz >= minHz && n.hz <= maxHz);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.[0]?.value) {
      const d = payload[0].payload;
      return (
        <div className="bg-surface border border-border rounded px-3 py-2 text-sm">
          <div className="text-muted font-mono">{d.time}s</div>
          <div className="text-accent font-bold">{d.hz} Hz</div>
          <div className="text-text">{d.note}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="#64748b"
            tick={{ fill: "#64748b", fontSize: 11, fontFamily: "Space Mono" }}
            tickFormatter={(v) => `${v}s`}
          />
          <YAxis
            domain={[minHz, maxHz]}
            stroke="#64748b"
            tick={{ fill: "#64748b", fontSize: 11, fontFamily: "Space Mono" }}
            tickFormatter={(v) => `${Math.round(v)}Hz`}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          {noteLines.map((n) => (
            <ReferenceLine
              key={n.label}
              y={n.hz}
              stroke="#1e2535"
              strokeDasharray="4 4"
              label={{ value: n.label, position: "right", fill: "#475569", fontSize: 10 }}
            />
          ))}
          <Line
            type="monotone"
            dataKey="hz"
            stroke="#00e5ff"
            strokeWidth={1.5}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Word timestamp markers */}
      {transcriptWords.length > 0 && (
        <div className="relative h-6 mt-1 border-t border-border">
          {transcriptWords.map((w, i) => {
            const left = (w.start / durationSec) * 100;
            return (
              <span
                key={i}
                className="absolute text-[9px] font-mono text-muted whitespace-nowrap"
                style={{ left: `${left}%`, transform: "translateX(-50%)", top: 4 }}
              >
                {w.word}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
