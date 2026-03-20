"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type RecorderState = "idle" | "requesting" | "recording" | "paused" | "processing";

export interface RecorderResult {
  state: RecorderState;
  duration: number;             // seconds elapsed
  waveformData: Float32Array;   // latest amplitude data for visualisation
  audioBlob: Blob | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
}

const WAVEFORM_SAMPLES = 128; // Number of bars in waveform display

export function useRecorder(): RecorderResult {
  const [state, setState] = useState<RecorderState>("idle");
  const [duration, setDuration] = useState(0);
  const [waveformData, setWaveformData] = useState<Float32Array>(
    new Float32Array(WAVEFORM_SAMPLES)
  );
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Determine best MIME type for current browser
  const getMimeType = (): string => {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",       // Safari fallback
      "audio/ogg;codecs=opus",
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return "";
  };

  // Waveform animation loop
  const startWaveformLoop = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const dataArray = new Float32Array(analyser.fftSize);

    const tick = () => {
      analyser.getFloatTimeDomainData(dataArray);

      // Downsample to WAVEFORM_SAMPLES bars
      const blockSize = Math.floor(dataArray.length / WAVEFORM_SAMPLES);
      const result = new Float32Array(WAVEFORM_SAMPLES);
      for (let i = 0; i < WAVEFORM_SAMPLES; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(dataArray[i * blockSize + j]);
        }
        result[i] = sum / blockSize;
      }

      setWaveformData(result);
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  const stopWaveformLoop = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setState("requesting");
      setError(null);
      chunksRef.current = [];
      setAudioBlob(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // Keep natural voice
          sampleRate: 44100,
          channelCount: 1,
        },
      });
      streamRef.current = stream;

      // Set up AudioContext for waveform analysis
      const audioContext = new AudioContext({ sampleRate: 44100 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Set up MediaRecorder
      const mimeType = getMimeType();
      const recorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
        audioBitsPerSecond: 128_000,
      });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || "audio/webm",
        });
        setAudioBlob(blob);
        stopWaveformLoop();
        setWaveformData(new Float32Array(WAVEFORM_SAMPLES));
      };

      recorder.start(250); // Collect data every 250ms
      startTimeRef.current = Date.now();
      setState("recording");
      startWaveformLoop();

      // Duration timer
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Microphone access denied";
      setError(
        message.includes("Permission denied") || message.includes("NotAllowed")
          ? "Microphone permission denied. Please allow access in your browser settings."
          : `Recording error: ${message}`
      );
      setState("idle");
    }
  }, [startWaveformLoop, stopWaveformLoop]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();
    setState("processing");
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      stopWaveformLoop();
      setState("paused");
    }
  }, [stopWaveformLoop]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      startTimeRef.current = Date.now() - duration * 1000;
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
      startWaveformLoop();
      setState("recording");
    }
  }, [duration, startWaveformLoop]);

  const resetRecording = useCallback(() => {
    stopRecording();
    setAudioBlob(null);
    setDuration(0);
    setError(null);
    chunksRef.current = [];
    setWaveformData(new Float32Array(WAVEFORM_SAMPLES));
    setState("idle");
  }, [stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopWaveformLoop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioContextRef.current?.close();
    };
  }, [stopWaveformLoop]);

  return {
    state,
    duration,
    waveformData,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  };
}
