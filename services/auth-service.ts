import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateOTP, generateVerificationToken, hashToken, verifyTokenHash } from "@/lib/auth/tokens";
import { getEmailProvider } from "@/lib/email/email-service";
import { RegisterInput, LoginInput } from "@/schemas/auth-schemas";
import { UserRole, UserSession, VerificationResult } from "@/types/auth";
import { logAuditEvent } from "@/lib/audit-logger";

const OTP_EXPIRY_MINUTES = 15;
const RESET_TOKEN_EXPIRY_HOURS = 1;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_VERIFICATION_ATTEMPTS = 5;

export class AuthService {
  /**
   * Registers a new user, creates role-specific profile, logs audit event, and sends initial verification email.
   */
  static async registerUser(input: RegisterInput & {
    headline?: string;
    subjects?: string;
    experienceYears?: number;
    hourlyRate?: number;
    qualifications?: string;
    languages?: string;
    teachingMode?: string;
    gradeLevel?: string;
    interests?: string;
    learningPreferences?: string;
    emergencyContact?: string;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error("An account with this email already exists.");
    }

    const passwordHash = await hashPassword(input.password);
    const role = input.role as UserRole;

    if (role === "ADMIN") {
      throw new Error("Public registration is disabled for administrative accounts.");
    }

    // Transactionally create User and corresponding Profile
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        role,
        emailVerified: false,
        profile: {
          create: {
            firstName: input.firstName,
            lastName: input.lastName,
          },
        },
        ...(role === "TEACHER" && {
          teacherProfile: {
            create: {
              headline: input.headline || "Educator",
              subjects: input.subjects || "Mathematics",
              experienceYears: input.experienceYears || 0,
              hourlyRate: input.hourlyRate || 40.0,
              qualifications: input.qualifications,
              languages: input.languages || "English",
              teachingMode: input.teachingMode || "ONLINE",
              verificationStatus: "PENDING",
            },
          },
        }),
        ...(role === "STUDENT" && {
          studentProfile: {
            create: {
              gradeLevel: input.gradeLevel || "Grade 10",
              interests: input.interests,
              learningPreferences: input.learningPreferences,
            },
          },
        }),
      },
      include: {
        profile: true,
      },
    });

    await logAuditEvent(user.id, "USER_REGISTERED", { role, email: user.email });

    // Send verification email
    await this.createAndSendVerification(user.id, user.email, input.firstName);

    return {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      emailVerified: user.emailVerified,
      firstName: user.profile?.firstName || input.firstName,
      lastName: user.profile?.lastName || input.lastName,
    };
  }

  /**
   * Generates OTP/Token, stores hashes in DB, and dispatches email via provider.
   */
  static async createAndSendVerification(userId: string, email: string, firstName: string) {
    const otp = generateOTP();
    const rawToken = generateVerificationToken();
    const codeHash = hashToken(otp);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Save hashed tokens to database
    await prisma.emailVerification.create({
      data: {
        userId,
        codeHash,
        tokenHash,
        expiresAt,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/verify-email?token=${rawToken}&email=${encodeURIComponent(email)}`;

    const provider = getEmailProvider();
    await provider.sendVerificationEmail({
      to: email,
      subject: "Verify your EduConnect email",
      templateParams: {
        recipientEmail: email,
        firstName,
        otp,
        verificationUrl,
        expiresInMinutes: OTP_EXPIRY_MINUTES,
      },
    });
  }

  /**
   * Resends verification email enforcing rate-limiting cooldown.
   */
  static async resendVerification(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true, emailVerifications: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    if (!user) {
      throw new Error("No account found with this email address.");
    }

    if (user.emailVerified) {
      return { success: true, message: "Email is already verified.", alreadyVerified: true };
    }

    const latestVerification = user.emailVerifications[0];
    if (latestVerification) {
      const secondsSinceLast = Math.floor((Date.now() - latestVerification.createdAt.getTime()) / 1000);
      if (secondsSinceLast < RESEND_COOLDOWN_SECONDS) {
        const waitTime = RESEND_COOLDOWN_SECONDS - secondsSinceLast;
        throw new Error(`Please wait ${waitTime} seconds before requesting another code.`);
      }
    }

    await this.createAndSendVerification(user.id, user.email, user.profile?.firstName || "Learner");

    return {
      success: true,
      message: "Verification email resent successfully.",
    };
  }

  /**
   * Validates a 6-digit OTP entered by user.
   */
  static async verifyOTP(email: string, otp: string): Promise<VerificationResult> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        emailVerifications: {
          where: { verifiedAt: null },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new Error("Account not found.");
    }

    if (user.emailVerified) {
      return { success: true, message: "Email is already verified.", alreadyVerified: true };
    }

    const record = user.emailVerifications[0];
    if (!record) {
      throw new Error("No active verification request found. Please request a new code.");
    }

    if (record.attempts >= MAX_VERIFICATION_ATTEMPTS) {
      throw new Error("Too many failed attempts. Please request a new verification code.");
    }

    if (new Date() > record.expiresAt) {
      throw new Error("Verification code has expired. Please click Resend to get a new code.");
    }

    const isValid = verifyTokenHash(otp, record.codeHash);

    if (!isValid) {
      // Increment attempt counter
      await prisma.emailVerification.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      const remaining = MAX_VERIFICATION_ATTEMPTS - (record.attempts + 1);
      throw new Error(`Invalid verification code. ${remaining} attempts remaining.`);
    }

    const now = new Date();

    // Transactionally verify user and mark verification record
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, emailVerifiedAt: now },
      }),
      prisma.emailVerification.update({
        where: { id: record.id },
        data: { verifiedAt: now },
      }),
    ]);

    await logAuditEvent(user.id, "EMAIL_VERIFIED", { email: user.email });

    return {
      success: true,
      message: "Email successfully verified!",
    };
  }

  /**
   * Validates a link verification token from email.
   */
  static async verifyToken(token: string, email: string): Promise<VerificationResult> {
    const hashed = hashToken(token);

    const record = await prisma.emailVerification.findFirst({
      where: {
        tokenHash: hashed,
        verifiedAt: null,
      },
      include: { user: true },
    });

    if (!record) {
      throw new Error("Invalid or expired verification token link.");
    }

    if (record.user.emailVerified) {
      return { success: true, message: "Email is already verified.", alreadyVerified: true };
    }

    if (new Date() > record.expiresAt) {
      throw new Error("Verification link has expired. Please request a new code.");
    }

    const now = new Date();

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true, emailVerifiedAt: now },
      }),
      prisma.emailVerification.update({
        where: { id: record.id },
        data: { verifiedAt: now },
      }),
    ]);

    await logAuditEvent(record.userId, "EMAIL_VERIFIED", { email });

    return {
      success: true,
      message: "Email successfully verified via verification link!",
    };
  }

  /**
   * Initiates forgot password reset token generation and email dispatch.
   */
  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true },
    });

    // Enumeration protection: return generic success even if user not found
    if (!user) {
      return { success: true, message: "If an account exists for this email, password reset instructions have been sent." };
    }

    const rawToken = generateVerificationToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    await logAuditEvent(user.id, "PASSWORD_RESET_REQUESTED", { email: user.email });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    console.log("\n==================================================");
    console.log("🔑 [PASSWORD RESET REQUESTED]");
    console.log(`To: ${user.email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log("==================================================\n");

    return {
      success: true,
      message: "If an account exists for this email, password reset instructions have been sent.",
    };
  }

  /**
   * Resets password using validated reset token.
   */
  static async resetPassword(token: string, email: string, newPassword: string) {
    const tokenHash = hashToken(token);

    const record = await prisma.passwordReset.findFirst({
      where: {
        tokenHash,
        usedAt: null,
      },
      include: { user: true },
    });

    if (!record) {
      throw new Error("Invalid or expired password reset token link.");
    }

    if (new Date() > record.expiresAt) {
      throw new Error("Password reset link has expired. Please request a new reset link.");
    }

    const newPasswordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.passwordReset.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    await logAuditEvent(record.userId, "PASSWORD_RESET_COMPLETED", { email });

    return {
      success: true,
      message: "Password reset successful! You can now log in with your new password.",
    };
  }

  /**
   * Authenticates user with email and password.
   */
  static async loginUser(input: LoginInput): Promise<UserSession> {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      include: { profile: true },
    });

    if (!user) {
      await logAuditEvent(null, "LOGIN_FAILED", { email: input.email });
      throw new Error("Invalid email or password.");
    }

    const isMatch = await verifyPassword(input.password, user.passwordHash);
    if (!isMatch) {
      await logAuditEvent(user.id, "LOGIN_FAILED", { email: input.email });
      throw new Error("Invalid email or password.");
    }

    await logAuditEvent(user.id, "LOGIN_SUCCESS", { role: user.role });

    return {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      emailVerified: user.emailVerified,
      firstName: user.profile?.firstName || "User",
      lastName: user.profile?.lastName || "",
    };
  }
}
