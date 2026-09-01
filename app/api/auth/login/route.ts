export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { LoginSchema } from "@/schemas/auth-schemas";
import { AuthService } from "@/services/auth-service";
import { apiSuccess, apiBadRequest, apiError } from "@/lib/api-response";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = LoginSchema.parse(body);

    // If OTP is provided in the login payload, validate both credentials and OTP atomically
    if (validatedData.otp) {
      await AuthService.validateCredentials(validatedData.email, validatedData.password);
      const result = await AuthService.verifyOTP(validatedData.email, validatedData.otp);

      if (result.user) {
        await setSessionCookie(result.user);
      }

      return apiSuccess(
        {
          user: result.user,
          requiresVerification: false,
          requiresOtp: false,
          redirectPath: result.redirectPath,
        },
        "Login successful!"
      );
    }

    // Step 1: Validate credentials and dispatch mandatory OTP (no session created yet)
    const loginResult = await AuthService.loginUser(validatedData);

    return apiSuccess(
      {
        user: loginResult,
        requiresVerification: true,
        requiresOtp: true,
        redirectPath: `/verify-email?email=${encodeURIComponent(loginResult.email)}`,
      },
      "Credentials verified. Please enter the 6-digit OTP sent to your email."
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return apiBadRequest(error.errors[0]?.message || "Invalid login credentials.");
    }
    return apiError(error.message || "Invalid credentials.", 401);
  }
}
