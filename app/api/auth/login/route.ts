export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { LoginSchema } from "@/schemas/auth-schemas";
import { AuthService } from "@/services/auth-service";
import { apiSuccess, apiBadRequest, apiError } from "@/lib/api-response";
import { setSessionCookie } from "@/lib/auth/session";
import { isEducatorRole, isLearnerRole } from "@/lib/auth/guards";
import { UserRole, UserSession } from "@/types/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = LoginSchema.parse(body);

    // If OTP is provided in the login payload, validate credentials (if password given) and OTP atomically
    if (validatedData.otp) {
      if (validatedData.password) {
        await AuthService.validateCredentials(validatedData.email, validatedData.password);
      }
      const result = await AuthService.verifyOTP(validatedData.email, validatedData.otp);

      if (result.user) {
        await setSessionCookie(result.user);
      }

      let redirectPath = result.redirectPath || "/";
      if (result.user) {
        if (isEducatorRole(result.user.role)) {
          redirectPath = "/teacher/dashboard";
        } else if (isLearnerRole(result.user.role)) {
          redirectPath = "/student/dashboard";
        } else if (result.user.role === "ADMIN") {
          redirectPath = "/admin";
        } else if (result.user.role === "STAFF") {
          redirectPath = "/staff/dashboard";
        }
      }

      return apiSuccess(
        {
          user: result.user,
          requiresVerification: false,
          requiresOtp: false,
          redirectPath,
        },
        "Login successful!"
      );
    }

    // Step 1: Validate email & password credentials
    if (!validatedData.password) {
      return apiBadRequest("Password is required to sign in.");
    }

    const user = await AuthService.validateCredentials(validatedData.email, validatedData.password);

    if (user.status !== "ACTIVE") {
      return apiError("Account is suspended or deactivated. Access denied.", 403);
    }

    // Step 2: If user email is not yet verified, dispatch OTP
    if (!user.emailVerified) {
      await AuthService.createAndSendVerification(user.id, user.email, user.profile?.firstName || "Learner");
      return apiSuccess(
        {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            emailVerified: false,
          },
          requiresVerification: true,
          requiresOtp: true,
          redirectPath: `/verify-email?email=${encodeURIComponent(user.email)}`,
        },
        "Credentials verified. Please enter the 6-digit OTP sent to your email."
      );
    }

    // Step 3: User is verified. Create authenticated server session immediately.
    const userSession: UserSession = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      emailVerified: true,
      firstName: user.profile?.firstName || "User",
      lastName: user.profile?.lastName || "",
      name: user.profile ? `${user.profile.firstName} ${user.profile.lastName}`.trim() : user.email,
      avatarUrl: user.profile?.avatarUrl || null,
      status: user.status,
    };

    await setSessionCookie(userSession);

    // Step 4: Determine canonical dashboard redirect strictly based on actual server/database role
    let redirectPath = "/";
    if (isEducatorRole(user.role)) {
      redirectPath = "/teacher/dashboard";
    } else if (isLearnerRole(user.role)) {
      redirectPath = "/student/dashboard";
    } else if (user.role === "ADMIN") {
      redirectPath = "/admin";
    } else if (user.role === "STAFF") {
      redirectPath = "/staff/dashboard";
    }

    return apiSuccess(
      {
        user: userSession,
        requiresVerification: false,
        requiresOtp: false,
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
