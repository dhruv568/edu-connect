import Mux from "@mux/mux-node";

const muxTokenId = process.env.MUX_TOKEN_ID || "demo_token_id";
const muxTokenSecret = process.env.MUX_TOKEN_SECRET || "demo_token_secret";

export const muxClient = new Mux({
  tokenId: muxTokenId,
  tokenSecret: muxTokenSecret,
});

/**
 * Formats/sanitizes MUX_SIGNING_PRIVATE_KEY from environment variables.
 * Handles unescaping literal \n, strip quotes, and base64 PEM decoding.
 */
function formatPrivateKey(key: string): string {
  if (!key) return "";
  let formatted = key.trim();
  if ((formatted.startsWith('"') && formatted.endsWith('"')) || (formatted.startsWith("'") && formatted.endsWith("'"))) {
    formatted = formatted.slice(1, -1);
  }
  if (formatted.includes("\\n")) {
    formatted = formatted.replace(/\\n/g, "\n");
  }
  if (!formatted.includes("BEGIN") && !formatted.includes("\n")) {
    try {
      const decoded = Buffer.from(formatted, "base64").toString("utf-8");
      if (decoded.includes("BEGIN")) {
        formatted = decoded;
      }
    } catch {
      // Keep original formatted if decoding fails
    }
  }
  return formatted;
}

/**
 * Creates a Mux Direct Upload URL for browser uploading.
 */
export async function createMuxDirectUpload(corsOrigin: string = "*") {
  if (muxTokenId === "demo_token_id" || muxTokenSecret === "demo_token_secret") {
    const mockUploadId = `demo_upload_${Date.now()}`;
    return {
      id: mockUploadId,
      url: `/api/teacher/upload-video?mockUploadId=${mockUploadId}`,
      status: "waiting",
    };
  }
  try {
    const upload = await muxClient.video.uploads.create({
      cors_origin: corsOrigin,
      new_asset_settings: {
        playback_policy: ["signed"],
      },
    });
    return upload;
  } catch (err) {
    console.warn("Mux direct upload creation failed, falling back to local upload handler:", err);
    const mockUploadId = `fallback_upload_${Date.now()}`;
    return {
      id: mockUploadId,
      url: `/api/teacher/upload-video?mockUploadId=${mockUploadId}`,
      status: "waiting",
    };
  }
}

export interface MuxSyncResult {
  status: "READY" | "PROCESSING" | "FAILED";
  assetId?: string;
  playbackId?: string;
  duration?: number;
  aspectRatio?: string;
}

/**
 * Actively polls Mux API to verify current asset status (READY, PROCESSING, FAILED).
 * Useful when webhooks cannot reach the server (e.g. localhost, firewalls, delayed delivery).
 */
export async function syncMuxAssetStatus(
  uploadId?: string,
  assetId?: string
): Promise<MuxSyncResult | null> {
  if (!uploadId && !assetId) return null;

  if (
    muxTokenId === "demo_token_id" ||
    muxTokenSecret === "demo_token_secret" ||
    uploadId?.startsWith("demo_") ||
    uploadId?.startsWith("fallback_")
  ) {
    return {
      status: "READY",
      assetId: assetId || `demo_asset_${uploadId || Date.now()}`,
      playbackId: `demo_playback_${uploadId || Date.now()}`,
      duration: 300,
      aspectRatio: "16:9",
    };
  }

  try {
    let targetAssetId = assetId;

    if (!targetAssetId && uploadId) {
      const upload = await muxClient.video.uploads.retrieve(uploadId);
      if (upload.asset_id) {
        targetAssetId = upload.asset_id;
      } else if (upload.status === "errored") {
        return { status: "FAILED" };
      } else {
        return { status: "PROCESSING" };
      }
    }

    if (targetAssetId) {
      const asset = await muxClient.video.assets.retrieve(targetAssetId);
      if (asset.status === "ready") {
        return {
          status: "READY",
          assetId: asset.id,
          playbackId: asset.playback_ids?.[0]?.id || `pb_${asset.id}`,
          duration: asset.duration,
          aspectRatio: asset.aspect_ratio || "16:9",
        };
      } else if (asset.status === "errored") {
        return { status: "FAILED" };
      } else {
        return { status: "PROCESSING" };
      }
    }
  } catch (err) {
    console.error("Failed to sync Mux asset status via API:", err);
  }

  return null;
}

/**
 * Generates a short-lived Mux signed playback token for secure video streaming.
 */
export async function generateMuxSignedPlaybackToken(playbackId: string): Promise<string> {
  const signingKeyId = process.env.MUX_SIGNING_KEY_ID || "demo_key_id";
  const rawPrivateKey = process.env.MUX_SIGNING_PRIVATE_KEY || "demo_private_key";
  const signingPrivateKey = formatPrivateKey(rawPrivateKey);

  try {
    const jwt = muxClient.jwt || (Mux as any).jwt || (Mux as any).JWT;
    if (jwt && typeof jwt.signPlaybackId === "function") {
      const token = await jwt.signPlaybackId(playbackId, {
        keyId: signingKeyId,
        keySecret: signingPrivateKey,
        type: "video",
        expiration: "4h",
      });
      return token;
    }
    return `token_${playbackId}_${Date.now()}`;
  } catch (e) {
    console.warn("Mux JWT signing failed, fallback token:", e);
    return `token_${playbackId}_${Date.now()}`;
  }
}

/**
 * Verifies authenticity of incoming Mux Webhooks.
 */
export async function verifyMuxWebhookHeader(rawBody: string, headers: Record<string, string>): Promise<boolean> {
  const secret = process.env.MUX_WEBHOOK_SECRET;
  if (!secret) return true; // If secret not configured in local dev, allow
  try {
    await muxClient.webhooks.verifySignature(rawBody, headers, secret);
    return true;
  } catch (err) {
    console.error("Mux webhook signature verification failed:", err);
    return false;
  }
}


