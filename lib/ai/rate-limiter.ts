/**
 * Rate Limiter for EduConnects AI Assistant API
 * Tracks request counts per key (IP or User ID) within a rolling time window.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup stale entries periodically
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (record.resetAt <= now) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
  if (timer && typeof timer.unref === "function") {
    timer.unref();
  }
}

export const MAX_MESSAGE_LENGTH = 1000;
export const MAX_HISTORY_MESSAGES = 20;
export const RATE_LIMIT_MAX_REQUESTS = 15; // 15 requests
export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // per 1 minute

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Check if a request from the given identifier is within rate limits.
 */
export function checkRateLimit(
  identifier: string,
  maxRequests = RATE_LIMIT_MAX_REQUESTS,
  windowMs = RATE_LIMIT_WINDOW_MS
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || record.resetAt <= now) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetInSeconds: Math.ceil((record.resetAt - now) / 1000),
  };
}

/**
 * Sanitize and validate incoming user message.
 */
export function validateAiMessage(rawMessage: unknown): {
  valid: boolean;
  message?: string;
  error?: string;
} {
  if (typeof rawMessage !== "string") {
    return { valid: false, error: "Message must be a text string." };
  }

  const trimmed = rawMessage.trim();
  if (!trimmed) {
    return { valid: false, error: "Message cannot be empty." };
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return {
      valid: false,
      error: `Message exceeds the maximum allowed length of ${MAX_MESSAGE_LENGTH} characters.`,
    };
  }

  return { valid: true, message: trimmed };
}
