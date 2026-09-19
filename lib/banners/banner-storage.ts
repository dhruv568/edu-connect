import fs from "fs";
import path from "path";
import crypto from "crypto";

const BANNERS_DIR = path.join(process.cwd(), "storage", "banners");

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];

const MAX_BANNER_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

function ensureBannersDir() {
  if (!fs.existsSync(BANNERS_DIR)) {
    fs.mkdirSync(BANNERS_DIR, { recursive: true });
  }
}

/**
 * Validates and saves an uploaded banner image.
 * Returns the public URL path to access the banner image.
 */
export async function saveBannerImage(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<string> {
  const cleanMime = (mimeType || "").split(";")[0].trim().toLowerCase();
  const ext = path.extname(originalName).toLowerCase();

  if (!ALLOWED_MIME_TYPES.includes(cleanMime)) {
    throw new Error(
      `Invalid image format '${cleanMime}'. Supported formats: JPG, PNG, WebP, GIF, SVG.`
    );
  }

  if (ext && !ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(
      `Invalid file extension '${ext}'. Allowed: .jpg, .jpeg, .png, .webp, .gif, .svg.`
    );
  }

  if (buffer.length > MAX_BANNER_SIZE_BYTES) {
    throw new Error("Banner image size exceeds maximum limit of 10MB.");
  }

  ensureBannersDir();

  const safeExt = ALLOWED_EXTENSIONS.includes(ext)
    ? ext
    : cleanMime === "image/png"
    ? ".png"
    : cleanMime === "image/webp"
    ? ".webp"
    : cleanMime === "image/svg+xml"
    ? ".svg"
    : cleanMime === "image/gif"
    ? ".gif"
    : ".jpg";

  const randomKey = `banner_${crypto.randomUUID()}${safeExt}`;
  const filePath = path.join(BANNERS_DIR, randomKey);

  await fs.promises.writeFile(filePath, buffer);

  return `/api/banners/image/${randomKey}`;
}

/**
 * Retrieves the local file path for a stored banner image key.
 */
export function getBannerFilePath(key: string): string | null {
  ensureBannersDir();
  const safeName = path.basename(key);
  const filePath = path.join(BANNERS_DIR, safeName);
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  return null;
}
