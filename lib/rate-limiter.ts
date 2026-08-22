import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  limit?: number; // Maximum allowed requests
  windowMs?: number; // Time window in milliseconds
}

/**
 * Checks rate limiting for an incoming serverless request based on IP address and key identifier.
 */
export function checkRateLimit(
  request: NextRequest,
  keyPrefix: string = "global",
  options: RateLimitOptions = {}
): { allowed: boolean; remaining: number; resetSeconds: number } {
  const limit = options.limit || 5;
  const windowMs = options.windowMs || 60 * 1000; // Default 1 minute window

  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "127.0.0.1";

  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();

  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= limit) {
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetSeconds: resetSeconds > 0 ? resetSeconds : 1,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetSeconds: Math.ceil((record.resetTime - now) / 1000),
  };
}
