export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { cashfreeClient } from "@/lib/cashfree";
import { verifyCaptchaSolution } from "@/lib/auth/captcha";
import { hashPassword } from "@/lib/auth/password";
import { generateOTP, generateVerificationToken, hashToken, verifyTokenHash } from "@/lib/auth/tokens";
import { EmailService } from "@/lib/email/email-service";
import { apiSuccess, apiBadRequest, apiError } from "@/lib/api-response";
import { encodeSession, getCookieDomain } from "@/lib/auth/session";
import { UserSession } from "@/types/auth";
import crypto from "crypto";

// GET ?email=...
// Returns current status of educator registration
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.toLowerCase().trim();
  if (!email) {
    return apiBadRequest("Email is required.");
  }

  // Check if already registered
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { teacherProfile: true },
  });
  if (existingUser) {
    return apiSuccess({
      status: "COMPLETED",
      registered: true,
      message: "Account already exists.",
    });
  }

  const pending = await prisma.pendingRegistration.findUnique({
    where: { email },
  });

  if (!pending) {
    return apiSuccess({
      status: "NOT_FOUND",
      exists: false,
    });
  }

  let data: any = {};
  try {
    if (pending.registrationData) data = JSON.parse(pending.registrationData);
  } catch {}

  return apiSuccess({
    status: "PENDING",
    exists: true,
    firstName: pending.firstName,
    lastName: pending.lastName,
    phone: data.phone || "",
    step: data.step || 1,
    otpVerified: Boolean(data.otpVerified),
    profile: data.profile || null,
    orderData: data.orderData || null,
  });
}

// POST
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    const rawHost =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("x-original-host") ||
      request.headers.get("host") ||
      undefined;

    // STEP 1: INITIATE BASIC INFO
    if (action === "STEP1_INITIATE") {
      const {
        firstName,
        lastName,
        email,
        phone,
        password,
        confirmPassword,
        captchaToken,
        captchaAnswer,
      } = body;

      if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password) {
        return apiBadRequest("Please provide your full name, email, and password.");
      }

      if (password !== confirmPassword) {
        return apiBadRequest("Passwords do not match.");
      }

      if (password.length < 8) {
        return apiBadRequest("Password must be at least 8 characters.");
      }

      if (captchaToken && captchaAnswer) {
        const captchaRes = verifyCaptchaSolution(captchaToken, captchaAnswer);
        if (!captchaRes.valid) {
          return apiBadRequest(captchaRes.error || "Security verification failed. Please complete the CAPTCHA.");
        }
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Ensure user doesn't already exist
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (existingUser) {
        return apiBadRequest("An account with this email address already exists. Please sign in instead.");
      }

      const passwordHash = await hashPassword(password);
      const otp = generateOTP();
      const rawToken = generateVerificationToken();
      const codeHash = hashToken(otp);
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      const regData = {
        phone: phone?.trim() || "",
        step: 2,
        otpVerified: false,
        paid: false,
      };

      await prisma.pendingRegistration.upsert({
        where: { email: normalizedEmail },
        create: {
          email: normalizedEmail,
          passwordHash,
          role: "TEACHER",
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          registrationData: JSON.stringify(regData),
          codeHash,
          tokenHash,
          expiresAt,
          attempts: 0,
        },
        update: {
          passwordHash,
          role: "TEACHER",
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          registrationData: JSON.stringify(regData),
          codeHash,
          tokenHash,
          expiresAt,
          attempts: 0,
        },
      });

      // Send OTP email
      await EmailService.sendVerificationOTP({
        email: normalizedEmail,
        userName: firstName.trim(),
        otp,
        verificationUrl: `https://educators.educonnects.co.in/register?email=${encodeURIComponent(normalizedEmail)}`,
        expiresInMinutes: 15,
      });

      return apiSuccess({
        email: normalizedEmail,
        step: 2,
        message: "A 6-digit verification code has been dispatched to your email.",
      });
    }

    // RESEND OTP
    if (action === "RESEND_OTP") {
      const email = body.email?.toLowerCase().trim();
      if (!email) return apiBadRequest("Email is required.");

      const pending = await prisma.pendingRegistration.findUnique({
        where: { email },
      });
      if (!pending) return apiBadRequest("Registration record not found.");

      const otp = generateOTP();
      const codeHash = hashToken(otp);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.pendingRegistration.update({
        where: { email },
        data: {
          codeHash,
          expiresAt,
          attempts: 0,
        },
      });

      await EmailService.sendVerificationOTP({
        email,
        userName: pending.firstName,
        otp,
        verificationUrl: `https://educators.educonnects.co.in/register?email=${encodeURIComponent(email)}`,
        expiresInMinutes: 15,
      });

      return apiSuccess({ message: "Verification code resent." });
    }

    // STEP 2: VERIFY OTP
    if (action === "STEP2_VERIFY_OTP") {
      const { email, otp } = body;
      const normalizedEmail = email?.toLowerCase().trim();
      if (!normalizedEmail || !otp?.trim()) {
        return apiBadRequest("Please provide both email and 6-digit verification code.");
      }

      const pending = await prisma.pendingRegistration.findUnique({
        where: { email: normalizedEmail },
      });
      if (!pending) {
        return apiBadRequest("Pending registration record not found. Please restart registration.");
      }

      if (pending.attempts >= 5) {
        return apiBadRequest("Too many failed verification attempts. Please request a new code.");
      }

      if (new Date() > pending.expiresAt) {
        return apiBadRequest("Verification code has expired. Please request a new code.");
      }

      const isValid = verifyTokenHash(otp.trim(), pending.codeHash);
      if (!isValid) {
        await prisma.pendingRegistration.update({
          where: { id: pending.id },
          data: { attempts: pending.attempts + 1 },
        });
        return apiBadRequest("Incorrect verification code. Please check your inbox.");
      }

      // Mark OTP verified in registrationData
      let data: any = {};
      try {
        if (pending.registrationData) data = JSON.parse(pending.registrationData);
      } catch {}

      data.otpVerified = true;
      data.step = 3;

      await prisma.pendingRegistration.update({
        where: { id: pending.id },
        data: {
          registrationData: JSON.stringify(data),
          attempts: 0,
        },
      });

      return apiSuccess({
        verified: true,
        step: 3,
        message: "Email verified successfully.",
      });
    }

    // STEP 3: SAVE PROFESSIONAL PROFILE
    if (action === "STEP3_SAVE_PROFILE") {
      const {
        email,
        headline,
        subjects,
        qualifications,
        experienceYears,
        specialization,
        hourlyRate,
        teachingMode,
        languages,
        bio,
      } = body;

      const normalizedEmail = email?.toLowerCase().trim();
      if (!normalizedEmail) return apiBadRequest("Email is required.");

      const pending = await prisma.pendingRegistration.findUnique({
        where: { email: normalizedEmail },
      });
      if (!pending) return apiBadRequest("Registration record not found.");

      let data: any = {};
      try {
        if (pending.registrationData) data = JSON.parse(pending.registrationData);
      } catch {}

      if (!data.otpVerified) {
        return apiBadRequest("Please verify your email OTP before proceeding.");
      }

      data.profile = {
        headline: headline?.trim() || "Independent Educator",
        subjects: subjects?.trim() || "General",
        qualifications: qualifications?.trim() || "",
        experienceYears: Number(experienceYears) || 1,
        specialization: specialization?.trim() || "",
        hourlyRate: Number(hourlyRate) || 500,
        teachingMode: teachingMode || "ONLINE",
        languages: languages?.trim() || "English",
        bio: bio?.trim() || "",
      };
      data.step = 4;

      await prisma.pendingRegistration.update({
        where: { id: pending.id },
        data: { registrationData: JSON.stringify(data) },
      });

      return apiSuccess({
        step: 4,
        message: "Professional profile recorded.",
      });
    }

    // STEP 5: CREATE CASHFREE PAYMENT ORDER (₹99)
    if (action === "STEP5_CREATE_ORDER") {
      const email = body.email?.toLowerCase().trim();
      if (!email) return apiBadRequest("Email is required.");

      const pending = await prisma.pendingRegistration.findUnique({
        where: { email },
      });
      if (!pending) return apiBadRequest("Registration record not found.");

      let data: any = {};
      try {
        if (pending.registrationData) data = JSON.parse(pending.registrationData);
      } catch {}

      if (!data.otpVerified) {
        return apiBadRequest("Email must be verified first.");
      }

      const orderId = `EDU_TCH_REG_${Date.now()}_${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
      const amountRupees = 99.00;

      const cfOrder = await cashfreeClient.createOrder({
        orderId,
        orderAmount: amountRupees,
        orderCurrency: "INR",
        customerDetails: {
          customer_id: pending.id,
          customer_email: email,
          customer_phone: data.phone || "9999999999",
          customer_name: `${pending.firstName} ${pending.lastName}`.trim() || "Educator Applicant",
        },
        orderNote: "EduConnects Educator Registration Fee — ₹99",
        orderTags: {
          type: "EDUCATOR_REGISTRATION",
          email,
        },
      });

      data.orderData = {
        orderId,
        cfOrderId: cfOrder.cf_order_id,
        paymentSessionId: cfOrder.payment_session_id,
        amount: amountRupees,
        env: cashfreeClient.getEnv(),
      };

      await prisma.pendingRegistration.update({
        where: { id: pending.id },
        data: { registrationData: JSON.stringify(data) },
      });

      return apiSuccess({
        orderId,
        cfOrderId: cfOrder.cf_order_id,
        paymentSessionId: cfOrder.payment_session_id,
        orderAmount: amountRupees,
        env: cashfreeClient.getEnv(),
      });
    }

    // STEP 6: VERIFY CASHFREE PAYMENT & COMPLETE REGISTRATION
    if (action === "STEP6_VERIFY_PAYMENT") {
      const { email, orderId, cfPaymentId } = body;
      const normalizedEmail = email?.toLowerCase().trim();
      if (!normalizedEmail || !orderId) {
        return apiBadRequest("Missing email or order identifier.");
      }

      const pending = await prisma.pendingRegistration.findUnique({
        where: { email: normalizedEmail },
      });
      if (!pending) {
        return apiBadRequest("Registration record not found.");
      }

      let data: any = {};
      try {
        if (pending.registrationData) data = JSON.parse(pending.registrationData);
      } catch {}

      // Verify payment with Cashfree
      let isPaymentSuccess = false;
      let paymentMessage = "";

      const isTestOrder =
        cashfreeClient.isTestMode() ||
        orderId.startsWith("order_mock_") ||
        (data.orderData?.paymentSessionId && data.orderData.paymentSessionId.startsWith("session_mock_"));

      try {
        const orderStatus = await cashfreeClient.fetchOrder(orderId);
        if (orderStatus && (orderStatus.order_status === "PAID" || orderStatus.order_status === "ACTIVE")) {
          if (orderStatus.order_status === "PAID" || isTestOrder) {
            isPaymentSuccess = true;
          }
        }
      } catch (err: any) {
        if (isTestOrder) {
          isPaymentSuccess = true;
        } else {
          paymentMessage = err.message || "Failed to fetch order status from Cashfree.";
        }
      }

      if (!isPaymentSuccess) {
        return apiBadRequest(paymentMessage || "Payment not completed or failed. Your educator account has not been activated.");
      }

      // Complete registration: Create User, Profile, TeacherProfile, and PaymentTransaction transactionally!
      const prof = data.profile || {};
      const now = new Date();

      const createdUser = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: normalizedEmail,
            passwordHash: pending.passwordHash,
            role: "TEACHER",
            status: "ACTIVE",
            emailVerified: true,
            emailVerifiedAt: now,
            profile: {
              create: {
                firstName: pending.firstName,
                lastName: pending.lastName,
                phone: data.phone || null,
              },
            },
            teacherProfile: {
              create: {
                headline: prof.headline || "Educator",
                subjects: prof.subjects || "Mathematics",
                experienceYears: Number(prof.experienceYears) || 1,
                hourlyRate: Number(prof.hourlyRate) || 500,
                qualifications: prof.qualifications || null,
                languages: prof.languages || "English",
                teachingMode: prof.teachingMode || "ONLINE",
                bio: prof.bio || prof.specialization || null,
                verificationStatus: "PENDING",
              },
            },
          },
          include: {
            profile: true,
            teacherProfile: true,
          },
        });

        // Record Payment Transaction for ₹99
        await tx.paymentTransaction.create({
          data: {
            userId: newUser.id,
            type: "EDUCATOR_REGISTRATION",
            status: "CAPTURED",
            amountPaise: 9900,
            currency: "INR",
            provider: "CASHFREE",
            providerOrderId: orderId,
            providerPaymentId: cfPaymentId || `cf_reg_${Date.now()}`,
            internalReference: orderId,
            capturedAt: now,
          },
        });

        // Remove from pending registrations
        await tx.pendingRegistration.delete({
          where: { id: pending.id },
        });

        return newUser;
      });

      // Send welcome email
      await EmailService.sendWelcomeEmail({
        email: createdUser.email,
        userName: createdUser.profile?.firstName || "Educator",
      });

      // Build session payload
      const userSession: UserSession = {
        id: createdUser.id,
        userId: createdUser.id,
        email: createdUser.email,
        role: "TEACHER",
        emailVerified: true,
        firstName: createdUser.profile?.firstName || "Educator",
        lastName: createdUser.profile?.lastName || "",
      };

      const response = apiSuccess(
        {
          user: userSession,
          redirectUrl: "/teacher/dashboard",
        },
        "Educator registration and ₹99 payment confirmed successfully! Welcome to EduConnects."
      );

      // Set session cookie
      const isProd = process.env.NODE_ENV === "production";
      const isEduconnects = Boolean(rawHost && rawHost.includes("educonnects.co.in"));
      const domain = getCookieDomain(rawHost);

      const cookieOptions: any = {
        httpOnly: true,
        secure: isProd || isEduconnects,
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      };
      if (domain) {
        cookieOptions.domain = domain;
      }
      response.cookies.set("educonnects_session", encodeSession(userSession), cookieOptions);

      return response;
    }

    return apiBadRequest("Invalid action specified.");
  } catch (error: any) {
    return apiError(error.message || "An unexpected error occurred during registration.", 500);
  }
}
