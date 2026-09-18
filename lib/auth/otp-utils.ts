/**
 * Utility functions for parsing, cleaning, and normalizing 6-digit OTP codes.
 * Supports desktop paste, mobile paste, SMS autofill, and various text formats.
 */

/**
 * Normalizes and extracts up to 6 digits from an OTP input or pasted string.
 * Handles:
 * - Plain 6 digits: "123456"
 * - Spaced digits: "123 456", " 123456 ", "1 2 3 4 5 6"
 * - Hyphenated / dotted: "123-456", "123.456"
 * - Text prefixes / suffixes: "Your OTP is 123456", "Code: 123456.", "OTP: 123456 valid for 10 min"
 * - Bracketed / decorated: "[123456]"
 * - Non-breaking spaces and tabs
 */
export function extractOtpDigits(text: string): string {
  if (!text) return "";

  const trimmed = text.trim();

  // 1. Check for 3-3 grouped patterns like "123-456", "123 456", "123.456"
  const groupedMatch = trimmed.match(/\b(\d{3})[-\s.]+(\d{3})\b/);
  if (groupedMatch) {
    return `${groupedMatch[1]}${groupedMatch[2]}`;
  }

  // 2. Check for standalone 6-digit sequence like "123456" (surrounded by word boundaries or punctuation)
  const sixDigitMatch = trimmed.match(/(?:^|[^\d])(\d{6})(?:[^\d]|$)/);
  if (sixDigitMatch) {
    return sixDigitMatch[1];
  }

  // 3. Fallback: Strip all non-digit characters and take up to 6 digits
  const allDigits = trimmed.replace(/\D/g, "");
  return allDigits.slice(0, 6);
}
