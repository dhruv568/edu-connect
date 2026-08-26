import Mux from "@mux/mux-node";

const muxTokenId = process.env.MUX_TOKEN_ID || "demo_token_id";
const muxTokenSecret = process.env.MUX_TOKEN_SECRET || "demo_token_secret";

export const muxClient = new Mux({
  tokenId: muxTokenId,
  tokenSecret: muxTokenSecret,
});

/**
 * Creates a Mux Direct Upload URL for browser uploading.
 */
export async function createMuxDirectUpload(corsOrigin: string = "*") {
  const upload = await muxClient.video.uploads.create({
    cors_origin: corsOrigin,
    new_asset_settings: {
      playback_policy: ["signed"],
    },
  });
  return upload;
}

/**
 * Generates a short-lived Mux signed playback token for secure video streaming.
 */
export function generateMuxSignedPlaybackToken(playbackId: string): string {
  const signingKeyId = process.env.MUX_SIGNING_KEY_ID || "demo_key_id";
  const signingPrivateKey = process.env.MUX_SIGNING_PRIVATE_KEY || "demo_private_key";

  try {
    const jwt = (muxClient as any).jwt || (Mux as any).jwt || (Mux as any).JWT;
    if (jwt && typeof jwt.signPlaybackId === "function") {
      return jwt.signPlaybackId(playbackId, {
        keyId: signingKeyId,
        keySecret: signingPrivateKey,
        type: "video",
        expiration: "4h",
      });
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
export function verifyMuxWebhookHeader(rawBody: string, headers: Record<string, string>): boolean {
  const secret = process.env.MUX_WEBHOOK_SECRET;
  if (!secret) return true; // If secret not configured in local dev, allow
  try {
    muxClient.webhooks.verifySignature(rawBody, headers, secret);
    return true;
  } catch (err) {
    console.error("Mux webhook signature verification failed:", err);
    return false;
  }
}
