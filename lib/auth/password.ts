import bcrypt from "bcryptjs";

/**
 * Hashes a plain text password securely using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compares a plain text password against a stored bcrypt hash.
 * Supports trimmed comparison, direct equality (unhashed legacy seeds), and bcrypt compare.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;

  const trimmedHash = hash.trim();
  const trimmedPassword = password.trim();

  // 1. Direct equality check (in case stored as plain text)
  if (password === hash || password === trimmedHash || trimmedPassword === trimmedHash) {
    return true;
  }

  // 2. Standard bcrypt comparison
  try {
    if (await bcrypt.compare(password, trimmedHash)) {
      return true;
    }
  } catch {}

  // 3. Trimmed password bcrypt comparison (in case user had accidental leading/trailing space)
  try {
    if (await bcrypt.compare(trimmedPassword, trimmedHash)) {
      return true;
    }
  } catch {}

  return false;
}

