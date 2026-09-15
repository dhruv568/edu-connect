import { NextResponse } from "next/server";
import { generateCaptchaChallenge } from "@/lib/auth/captcha";

export const dynamic = "force-dynamic";

// GET: Generate fresh CAPTCHA challenge
export async function GET() {
  const challenge = generateCaptchaChallenge();
  return NextResponse.json({
    success: true,
    data: challenge,
  });
}
