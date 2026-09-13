export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { LoginSchema } from "@/schemas/auth-schemas";
import { AuthService } from "@/services/auth-service";
import { apiSuccess, apiBadRequest, apiError } from "@/lib/api-response";
import { setSessionCookie } from "@/lib/auth/session";
import { isEducatorRole, isLearnerRole } from "@/lib/auth/guards";
import { UserRole, UserSession } from "@/types/auth";

import { checkRateLimit } from "@/lib/rate-limiter";
import { prisma } from "@/lib/prisma";
import { getResendCooldownSeconds } from "@/lib/auth/tokens";
import { logAuditEvent } from "@/lib/audit-logger";

export async function POST(request: NextRequest) {
  // Rate limit: 10 login requests per minute per IP
  const rateLimit = checkRateLimit(request, "login", { limit: 10, windowMs: 60 * 1000 });
  if (!rateLimit.allowed) {
    return apiError(`Too many login attempts. Please wait ${rateLimit.resetSeconds} seconds before trying again.`, 429);
  }

  try {
    const rawHost =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("x-original-host") ||
      request.headers.get("host") ||
      undefined;
    const body = await request.json();
    const validatedData = LoginSchema.parse(body);

    // If OTP is provided in the login payload, validate credentials and OTP atomically
    if (validatedData.otp) {
      if (!validatedData.password) {
        return apiBadRequest("Password is required to authenticate.");
      }
      await AuthService.validateCredentials(validatedData.email, validatedData.password);
      const result = await AuthService.verifyOTP(validatedData.email, validatedData.otp);

      if (result.user) {
        await setSessionCookie(result.user, rawHost);
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

      const response = apiSuccess(
        {
          user: result.user,
          requiresVerification: false,
          requiresOtp: false,
          redirectPath,
        },
        "Login successful!"
      );
      response.cookies.delete("admin_pending_otp");
      return response;
    }

    // Step 1: Validate email & password credentials
    if (!validatedData.password) {
      return apiBadRequest("Password is required to sign in.");
    }

    const user = await AuthService.validateCredentials(validatedData.email, validatedData.password);

    if (user.status !== "ACTIVE") {
      return apiError("Account is suspended or deactivated. Access denied.", 403);
    }

    // Step 2: MANDATORY ADMIN TWO-FACTOR OTP VERIFICATION
    // For ADMIN role: Password verification alone MUST NEVER grant session or dashboard access.
    // Generates a dynamic 6-digit OTP dispatched to educonnects.com@gmail.com via Resend.
    if (user.role === "ADMIN") {
      const cooldownSeconds = getResendCooldownSeconds();
      const latestVerification = await prisma.emailVerification.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });

      if (latestVerification) {
        const secondsSinceLast = Math.floor((Date.now() - latestVerification.createdAt.getTime()) / 1000);
        if (secondsSinceLast < cooldownSeconds) {
          const waitTime = cooldownSeconds - secondsSinceLast;
          return apiError(`Please wait ${waitTime} seconds before requesting another code.`, 429);
        }
      }

      // Generate and dispatch dynamic OTP (never logged in terminal/PM2)
      await AuthService.createAndSendVerification(
        user.id,
        user.email,
        user.profile?.firstName || "System Administrator",
        true
      );

      await logAuditEvent(user.id, "LOGIN_OTP_DISPATCHED", { role: user.role });

      // DO NOT create authenticated session cookie here. Only temporary OTP verification state is returned.
      const response = apiSuccess(
        {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            emailVerified: false,
          },
          requiresVerification: true,
          requiresOtp: true,
          redirectPath: `/verify-email?email=${encodeURIComponent(user.email)}&redirectTo=%2Fadmin`,
        },
        "Credentials verified. A 6-digit verification code has been dispatched to your authorized admin email."
      );

      // Set temporary state cookie (10 minutes) indicating admin is waiting for OTP verification
      response.cookies.set("admin_pending_otp", encodeURIComponent(user.email), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" || Boolean(rawHost && rawHost.includes("educonnects.co.in")),
        sameSite: "lax",
        path: "/",
        maxAge: 10 * 60,
      });

      return response;
    }

    // Step 3: For non-admin accounts: If email is not yet verified, dispatch OTP
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

    // Step 4: Non-admin verified user. Create authenticated server session immediately.
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

    await setSessionCookie(userSession, rawHost);

    // Step 5: Determine canonical dashboard redirect strictly based on actual server/database role
    let redirectPath = "/";
    if (isEducatorRole(user.role)) {
      redirectPath = "/teacher/dashboard";
    } else if (isLearnerRole(user.role)) {
      redirectPath = "/student/dashboard";
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
