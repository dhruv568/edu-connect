export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { RegisterSchema } from "@/schemas/auth-schemas";
import { AuthService } from "@/services/auth-service";
import { apiSuccess, apiBadRequest, apiError } from "@/lib/api-response";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = RegisterSchema.parse(body);

    const user = await AuthService.registerUser(validatedData);

    // Set initial session cookie
    await setSessionCookie({
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: false,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return apiSuccess(
      {
        user,
        requiresVerification: true,
        redirectPath: `/verify-email?email=${encodeURIComponent(user.email)}`,
      },
      "Registration successful! Please check your email for the verification code.",
      201
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return apiBadRequest(error.errors[0]?.message || "Invalid registration form input.");
    }
    return apiError(error.message || "Failed to complete registration.", 400);
  }
}
