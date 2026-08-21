export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { ResendVerificationSchema } from "@/schemas/auth-schemas";
import { AuthService } from "@/services/auth-service";
import { apiSuccess, apiBadRequest, apiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ResendVerificationSchema.parse(body);

    const result = await AuthService.forgotPassword(validated.email);

    return apiSuccess(result, result.message);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return apiBadRequest(error.errors[0]?.message || "Invalid email parameter.");
    }
    return apiError(error.message || "Failed to process forgot password request.", 400);
  }
}
