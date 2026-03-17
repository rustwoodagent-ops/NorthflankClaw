"use client";

import { useEffect, useRef } from "react";

interface WaveformProps {
  data: Float32Array;
  isRecording: boolean;
  color?: string;
  height?: number;
}

export function LiveWaveform({
  data,
  isRecording,
  color = "#00e5ff",
  height = 80,
}: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const midY = H / 2;
    const barCount = data.length;
    const barWidth = W / barCount;
    const gap = barWidth * 0.25;

    ctx.clearRect(0, 0, W, H);

    // Draw bars
    for (let i = 0; i < barCount; i++) {
      const amplitude = data[i];
      const barH = Math.max(2, amplitude * H * 2.5);
      const x = i * barWidth + gap / 2;
      const bw = barWidth - gap;

      // Gradient per bar
      const gradient = ctx.createLinearGradient(0, midY - barH / 2, 0, midY + barH / 2);
      gradient.addColorStop(0, `${color}40`);
      gradient.addColorStop(0.5, color);
      gradient.addColorStop(1, `${color}40`);

      ctx.fillStyle = isRecording ? gradient : `${color}30`;
      ctx.beginPath();
      ctx.roundRect(x, midY - barH / 2, bw, barH, 2);
      ctx.fill();
    }

    // Center line when idle
    if (!isRecording) {
      ctx.strokeStyle = `${color}20`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(W, midY);
      ctx.stroke();
    }
  }, [data, isRecording, color]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height }}
    />
  );
}
