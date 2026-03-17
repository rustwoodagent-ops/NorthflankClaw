import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.S3_BUCKET!;

/**
 * Generate a pre-signed upload URL.
 * The client uploads directly to S3 — the server never touches the bytes.
 */
export async function getUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn });
}

/**
 * Generate a pre-signed download URL.
 */
export async function getDownloadUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, command, { expiresIn });
}

/**
 * Build a recording S3 key for a given user and job.
 */
export function buildRecordingKey(
  userId: string,
  recordingId: string,
  ext: string
): string {
  return `recordings/${userId}/${recordingId}/original.${ext}`;
}

export function buildStemKey(
  userId: string,
  recordingId: string,
  stem: "vocals" | "accompaniment" | "bass" | "drums"
): string {
  return `recordings/${userId}/${recordingId}/stems/${stem}.wav`;
}

export function buildSpectrogramKey(
  userId: string,
  recordingId: string
): string {
  return `recordings/${userId}/${recordingId}/spectrogram.png`;
}

export async function deleteObject(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export { s3, BUCKET };
