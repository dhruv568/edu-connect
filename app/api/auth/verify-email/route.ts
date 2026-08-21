import { NextRequest } from "next/server";
import { VerifyOTPSchema } from "@/schemas/auth-schemas";
import { AuthService } from "@/services/auth-service";
import { apiSuccess, apiBadRequest, apiError } from "@/lib/api-response";
import { getSession, setSessionCookie } from "@/lib/auth/session";

/**
 * POST /api/auth/verify-email
 * Verifies email via 6-digit OTP code input.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = VerifyOTPSchema.parse(body);

    const result = await AuthService.verifyOTP(validated.email, validated.otp);

    // Update active session if user is logged in
    const session = await getSession();
    if (session && session.email.toLowerCase() === validated.email.toLowerCase()) {
      await setSessionCookie({
        ...session,
        emailVerified: true,
      });
    }

    return apiSuccess(result, result.message);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return apiBadRequest(error.errors[0]?.message || "Invalid OTP code format.");
    }
    return apiError(error.message || "Failed to verify email.", 400);
  }
}

/**
 * GET /api/auth/verify-email?token=...&email=...
 * Verifies email via direct click link.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return apiBadRequest("Missing verification token or email parameter.");
  }

  try {
    const result = await AuthService.verifyToken(token, email);

    // Update active session if user is logged in
    const session = await getSession();
    if (session && session.email.toLowerCase() === email.toLowerCase()) {
      await setSessionCookie({
        ...session,
        emailVerified: true,
      });
    }

    return apiSuccess(result, result.message);
  } catch (error: any) {
    return apiError(error.message || "Failed to verify email link.", 400);
  }
}
