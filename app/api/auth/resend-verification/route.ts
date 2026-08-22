export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { ResendVerificationSchema } from "@/schemas/auth-schemas";
import { AuthService } from "@/services/auth-service";
import { apiSuccess, apiBadRequest, apiError } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/rate-limiter";

/**
 * POST /api/auth/resend-verification
 * Resends verification code enforcing cooldown and serverless rate limiting.
 */
export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "resend-verification", { limit: 5, windowMs: 60 * 1000 });
  if (!rateLimit.allowed) {
    return apiError(`Too many resend requests. Please wait ${rateLimit.resetSeconds} seconds before trying again.`, 429);
  }

  try {
    const body = await request.json();
    const validated = ResendVerificationSchema.parse(body);

    const result = await AuthService.resendVerification(validated.email);

    return apiSuccess(result, result.message);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return apiBadRequest(error.errors[0]?.message || "Invalid email parameter.");
    }
    return apiError(error.message || "We couldn't send your verification email. Please try again in a moment.", 400);
  }
}
