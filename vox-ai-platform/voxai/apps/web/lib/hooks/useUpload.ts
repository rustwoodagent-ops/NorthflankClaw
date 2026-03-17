"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/trpc/client";

export type UploadState = "idle" | "uploading" | "confirming" | "queued" | "error";

export interface UploadResult {
  uploadState: UploadState;
  uploadProgress: number;
  recordingId: string | null;
  uploadError: string | null;
  uploadRecording: (blob: Blob, duration: number, title?: string) => Promise<string | null>;
}

export function useUpload(): UploadResult {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const getUploadUrl = api.recordings.getUploadUrl.useMutation();
  const confirmUpload = api.recordings.confirmUpload.useMutation();

  const uploadRecording = useCallback(
    async (blob: Blob, duration: number, title?: string): Promise<string | null> => {
      try {
        setUploadState("uploading");
        setUploadProgress(0);
        setUploadError(null);

        // Determine file extension from blob type
        const mimeType = blob.type || "audio/webm";
        const ext = mimeType.includes("mp4") ? "m4a"
          : mimeType.includes("ogg") ? "ogg"
          : "webm";
        const filename = `recording.${ext}`;

        // Step 1: Get pre-signed URL
        const { recordingId: rid, uploadUrl } = await getUploadUrl.mutateAsync({
          filename,
          contentType: mimeType,
          durationSec: duration,
          title,
        });
        setRecordingId(rid);

        // Step 2: Upload directly to S3 via XHR (for progress tracking)
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              setUploadProgress(Math.round((e.loaded / e.total) * 100));
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`S3 upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => reject(new Error("Upload network error")));
          xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", mimeType);
          xhr.send(blob);
        });

        setUploadProgress(100);
        setUploadState("confirming");

        // Step 3: Confirm upload and enqueue processing
        await confirmUpload.mutateAsync({ recordingId: rid, durationSec: duration });

        setUploadState("queued");
        return rid;

      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setUploadError(message);
        setUploadState("error");
        return null;
      }
    },
    [getUploadUrl, confirmUpload]
  );

  return {
    uploadState,
    uploadProgress,
    recordingId,
    uploadError,
    uploadRecording,
  };
}
