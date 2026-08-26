import fs from "fs";
import path from "path";
import crypto from "crypto";

const VIDEOS_DIR = path.join(process.cwd(), "storage", "videos");
const RESOURCES_DIR = path.join(process.cwd(), "storage", "resources");
const THUMBNAILS_DIR = path.join(process.cwd(), "storage", "thumbnails");

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"];
const ALLOWED_RESOURCE_TYPES = [
  "application/pdf",
  "application/zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/png",
  "image/jpeg",
];
const ALLOWED_THUMBNAIL_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024; // 500MB
const MAX_RESOURCE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
const MAX_THUMBNAIL_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function ensureDirsExist() {
  [VIDEOS_DIR, RESOURCES_DIR, THUMBNAILS_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

export function validateVideoFile(mimeType: string, sizeInBytes: number): { valid: boolean; error?: string } {
  if (!ALLOWED_VIDEO_TYPES.includes(mimeType.toLowerCase())) {
    return { valid: false, error: `Unsupported video format '${mimeType}'. Supported: MP4, WebM, MOV.` };
  }
  if (sizeInBytes > MAX_VIDEO_SIZE_BYTES) {
    return { valid: false, error: `Video size exceeds limit of 500MB.` };
  }
  return { valid: true };
}

export async function saveVideoFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<{ storageKey: string; fileName: string; fileSize: number; fileType: string }> {
  const validation = validateVideoFile(mimeType, buffer.length);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  ensureDirsExist();

  const ext = path.extname(originalName).toLowerCase() || ".mp4";
  const randomKey = `video_${crypto.randomUUID()}${ext}`;
  const filePath = path.join(VIDEOS_DIR, randomKey);

  await fs.promises.writeFile(filePath, buffer);

  return {
    storageKey: randomKey,
    fileName: path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, "_"),
    fileSize: buffer.length,
    fileType: mimeType,
  };
}

export function getVideoFilePath(storageKey: string): string | null {
  ensureDirsExist();
  const safeName = path.basename(storageKey);
  const filePath = path.join(VIDEOS_DIR, safeName);
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  return null;
}

export async function saveResourceFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<{ storageKey: string; fileName: string; fileSize: number; fileType: string }> {
  if (!ALLOWED_RESOURCE_TYPES.includes(mimeType.toLowerCase())) {
    throw new Error(`Unsupported resource file type '${mimeType}'.`);
  }
  if (buffer.length > MAX_RESOURCE_SIZE_BYTES) {
    throw new Error("Resource size exceeds maximum limit of 25MB.");
  }
  ensureDirsExist();

  const ext = path.extname(originalName).toLowerCase() || ".pdf";
  const randomKey = `resource_${crypto.randomUUID()}${ext}`;
  const filePath = path.join(RESOURCES_DIR, randomKey);

  await fs.promises.writeFile(filePath, buffer);

  return {
    storageKey: randomKey,
    fileName: path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, "_"),
    fileSize: buffer.length,
    fileType: mimeType,
  };
}

export function getResourceFilePath(storageKey: string): string | null {
  ensureDirsExist();
  const safeName = path.basename(storageKey);
  const filePath = path.join(RESOURCES_DIR, safeName);
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  return null;
}

export async function saveThumbnailFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<string> {
  if (!ALLOWED_THUMBNAIL_TYPES.includes(mimeType.toLowerCase())) {
    throw new Error("Invalid thumbnail image format. Use JPG, PNG, or WebP.");
  }
  if (buffer.length > MAX_THUMBNAIL_SIZE_BYTES) {
    throw new Error("Thumbnail size must be under 5MB.");
  }
  ensureDirsExist();

  const ext = path.extname(originalName).toLowerCase() || ".jpg";
  const randomKey = `thumb_${crypto.randomUUID()}${ext}`;
  const filePath = path.join(THUMBNAILS_DIR, randomKey);

  await fs.promises.writeFile(filePath, buffer);

  // Accessible via public route or storage URL
  return `/api/thumbnails/${randomKey}`;
}
