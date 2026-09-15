import crypto from "crypto";

const CAPTCHA_SECRET =
  process.env.CAPTCHA_SECRET_KEY ||
  process.env.AUTH_SECRET ||
  "educonnects_production_captcha_secret_2026";

export interface CaptchaPayload {
  id: string;
  question: string;
  token: string;
}

export function generateCaptchaChallenge(): CaptchaPayload {
  const num1 = Math.floor(Math.random() * 12) + 3; // 3 to 14
  const num2 = Math.floor(Math.random() * 8) + 2;  // 2 to 9
  const answer = String(num1 + num2);
  const timestamp = Date.now();
  const id = `cap-${timestamp}-${Math.random().toString(36).substring(2, 7)}`;

  // Create HMAC signature
  const hmac = crypto.createHmac("sha256", CAPTCHA_SECRET);
  hmac.update(`${id}:${answer}:${timestamp}`);
  const signature = hmac.digest("hex");

  // Token stores id, timestamp, and signature (never exposes the raw answer)
  const token = Buffer.from(JSON.stringify({ id, timestamp, signature })).toString("base64");

  return {
    id,
    question: `What is ${num1} + ${num2}?`,
    token,
  };
}

export function verifyCaptchaSolution(token: string, userAnswer: string): { valid: boolean; error?: string } {
  if (!token || !userAnswer) {
    return { valid: false, error: "Please solve the security verification CAPTCHA." };
  }

  try {
    const raw = Buffer.from(token, "base64").toString("utf-8");
    const { id, timestamp, signature } = JSON.parse(raw);

    // Check expiration (5 minutes)
    if (Date.now() - timestamp > 5 * 60 * 1000) {
      return { valid: false, error: "Security CAPTCHA expired. Please refresh and try again." };
    }

    const cleanAnswer = userAnswer.trim();
    const hmac = crypto.createHmac("sha256", CAPTCHA_SECRET);
    hmac.update(`${id}:${cleanAnswer}:${timestamp}`);
    const expectedSig = hmac.digest("hex");

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return { valid: true };
    }

    return { valid: false, error: "Incorrect CAPTCHA answer. Please try again." };
  } catch (err) {
    return { valid: false, error: "Invalid CAPTCHA token format." };
  }
}
