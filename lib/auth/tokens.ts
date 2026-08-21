import crypto from "crypto";

/**
 * Generates a random 6-digit numeric OTP.
 */
export function generateOTP(): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += digits[crypto.randomInt(0, 10)];
  }
  return otp;
}

/**
 * Generates a secure random 32-byte hex token for link-based verification.
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Creates a SHA-256 hash of a code or token for secure database storage.
 */
export function hashToken(tokenOrOTP: string): string {
  return crypto.createHash("sha256").update(tokenOrOTP).digest("hex");
}

/**
 * Verifies if a given plain OTP or token matches a stored SHA-256 hash.
 */
export function verifyTokenHash(plainInput: string, storedHash: string): boolean {
  const computedHash = hashToken(plainInput);
  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(storedHash));
}

/**
 * Masks an email address for public privacy UI displays (e.g. `dh***@gmail.com`).
 */
export function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const [name, domain] = parts;
  if (name.length <= 2) {
    return `${name[0]}***@${domain}`;
  }
  return `${name.substring(0, 2)}***@${domain}`;
}
