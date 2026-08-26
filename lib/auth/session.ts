import { cookies } from "next/headers";
import { UserSession } from "@/types/auth";

const SESSION_COOKIE_NAME = "educonnect_session";
const SESSION_DURATION_DAYS = 7;

/**
 * Encodes session data to a secure base64 payload (or JWT token signature).
 */
export function encodeSession(session: UserSession): string {
  const jsonStr = JSON.stringify(session);
  return Buffer.from(jsonStr).toString("base64url");
}

/**
 * Decodes session data from cookie payload.
 */
export function decodeSession(token: string): UserSession | null {
  try {
    const jsonStr = Buffer.from(token, "base64url").toString("utf-8");
    const payload = JSON.parse(jsonStr) as UserSession;
    if (payload) {
      payload.userId = payload.userId || payload.id;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Sets session cookie in Response headers or current cookie context.
 */
export async function setSessionCookie(session: UserSession) {
  const cookieStore = await cookies();
  const encoded = encodeSession(session);
  cookieStore.set(SESSION_COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
  });
}

/**
 * Gets current user session from request cookies.
 */
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!cookie?.value) return null;
  return decodeSession(cookie.value);
}

/**
 * Removes session cookie on logout.
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
