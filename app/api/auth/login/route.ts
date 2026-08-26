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

    const userSession = await AuthService.loginUser(validatedData);

    await setSessionCookie(userSession);

    if (!userSession.emailVerified) {
      return apiSuccess(
        {
          user: userSession,
          requiresVerification: true,
          redirectPath: `/verify-email?email=${encodeURIComponent(userSession.email)}`,
        },
        "Please verify your email before continuing."
      );
    }

    const redirectPath = `/${userSession.role.toLowerCase()}/dashboard`;

    return apiSuccess(
      {
        user: userSession,
        requiresVerification: false,
        redirectPath,
      },
      "Login successful!"
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return apiBadRequest(error.errors[0]?.message || "Invalid login credentials.");
    }
    return apiError(error.message || "Invalid credentials.", 401);
  }
}
