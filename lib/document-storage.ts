import fs from "fs";
import path from "path";
import crypto from "crypto";

const STORAGE_DIR = path.join(process.cwd(), "storage", "documents");

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function ensureStorageDirExists() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

export function validateDocumentFile(mimeType: string, sizeInBytes: number): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file type '${mimeType}'. Supported formats are PDF, JPG, JPEG, PNG.`,
    };
  }

  if (sizeInBytes > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds limit of 10MB. Current size: ${(sizeInBytes / (1024 * 1024)).toFixed(2)}MB`,
    };
  }

  return { valid: true };
}

export async function saveDocumentToStorage(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<{ storageKey: string; fileName: string; fileSize: number; fileType: string }> {
  const validation = validateDocumentFile(mimeType, buffer.length);
  if (!validation.valid) {
    throw new Error(validation.error || "File validation failed");
  }

  ensureStorageDirExists();

  const ext = path.extname(originalName).toLowerCase() || getExtensionFromMime(mimeType);
  const randomKey = `${crypto.randomUUID()}${ext}`;
  const filePath = path.join(STORAGE_DIR, randomKey);

  await fs.promises.writeFile(filePath, buffer);

  const safeFileName = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, "_");

  return {
    storageKey: randomKey,
    fileName: safeFileName,
    fileSize: buffer.length,
    fileType: mimeType,
  };
}

export async function readDocumentFromStorage(storageKey: string): Promise<{ buffer: Buffer; filePath: string } | null> {
  ensureStorageDirExists();
  const filePath = path.join(STORAGE_DIR, path.basename(storageKey));
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const buffer = await fs.promises.readFile(filePath);
  return { buffer, filePath };
}

export async function deleteDocumentFromStorage(storageKey: string): Promise<boolean> {
  ensureStorageDirExists();
  const filePath = path.join(STORAGE_DIR, path.basename(storageKey));
  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath);
    return true;
  }
  return false;
}

function getExtensionFromMime(mime: string): string {
  switch (mime) {
    case "application/pdf":
      return ".pdf";
    case "image/jpeg":
    case "image/jpg":
      return ".jpg";
    case "image/png":
      return ".png";
    default:
      return ".bin";
  }
}
