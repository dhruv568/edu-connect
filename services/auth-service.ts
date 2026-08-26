import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateOTP, generateVerificationToken, hashToken, verifyTokenHash } from "@/lib/auth/tokens";
import { EmailService } from "@/lib/email/email-service";
import { RegisterInput, LoginInput } from "@/schemas/auth-schemas";
import { UserRole, UserSession, VerificationResult } from "@/types/auth";
import { logAuditEvent } from "@/lib/audit-logger";

const getOtpExpiryMinutes = () => Number(process.env.OTP_EXPIRY_MINUTES) || 10;
const getMaxAttempts = () => Number(process.env.OTP_MAX_ATTEMPTS) || 5;
const getResendCooldownSeconds = () => Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60;
const RESET_TOKEN_EXPIRY_HOURS = 1;

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
   * Generates OTP/Token, invalidates prior active OTPs so ONLY the newest OTP is valid,
   * stores hashes in DB, and dispatches email via Resend / EmailService.
   */
  static async createAndSendVerification(userId: string, email: string, firstName: string) {
    const expiryMinutes = getOtpExpiryMinutes();

    // Invalidate all previous unverified OTP records for this user (Single Active OTP requirement)
    await prisma.emailVerification.updateMany({
      where: {
        userId,
        verifiedAt: null,
      },
      data: {
        expiresAt: new Date(),
      },
    });

    const otp = generateOTP();
    const rawToken = generateVerificationToken();
    const codeHash = hashToken(otp);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Save hashed tokens to database
    await prisma.emailVerification.create({
      data: {
        userId,
        codeHash,
        tokenHash,
        expiresAt,
      },
    });

    const baseUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/verify-email?token=${rawToken}&email=${encodeURIComponent(email)}`;

    const sent = await EmailService.sendVerificationOTP({
      email,
      userName: firstName,
      otp,
      verificationUrl,
      expiresInMinutes: expiryMinutes,
    });

    if (!sent && process.env.NODE_ENV === "production") {
      console.error("❌ Failed to deliver verification OTP email via Resend provider.");
    }
  }

  /**
   * Sends or resends verification email enforcing rate-limiting cooldown and account checks.
   */
  static async sendVerification(email: string) {
    return this.resendVerification(email);
  }

  /**
   * Resends verification email enforcing rate-limiting cooldown.
   */
  static async resendVerification(email: string) {
    const cooldownSeconds = getResendCooldownSeconds();

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
      if (secondsSinceLast < cooldownSeconds) {
        const waitTime = cooldownSeconds - secondsSinceLast;
        throw new Error(`Please wait ${waitTime} seconds before requesting another code.`);
      }
    }

    await this.createAndSendVerification(user.id, user.email, user.profile?.firstName || "Learner");

    return {
      success: true,
      message: "Verification email sent successfully.",
    };
  }

  /**
   * Validates a 6-digit OTP entered by user. Enforces single active OTP, attempt limits, and expiration.
   */
  static async verifyOTP(email: string, otp: string): Promise<VerificationResult> {
    const maxAttempts = getMaxAttempts();

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        profile: true,
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
      throw new Error("No active verification code found. Please request a new code.");
    }

    // Check attempt count limit
    if (record.attempts >= maxAttempts) {
      // Invalidate expired/exhausted OTP
      await prisma.emailVerification.update({
        where: { id: record.id },
        data: { expiresAt: new Date() },
      });
      throw new Error("Too many incorrect attempts. Please request a new verification code.");
    }

    // Check expiration
    if (new Date() > record.expiresAt) {
      throw new Error("This verification code has expired. Please request a new code.");
    }

    const isValid = verifyTokenHash(otp, record.codeHash);

    if (!isValid) {
      const newAttempts = record.attempts + 1;
      // Increment attempt counter
      await prisma.emailVerification.update({
        where: { id: record.id },
        data: {
          attempts: newAttempts,
          ...(newAttempts >= maxAttempts ? { expiresAt: new Date() } : {}),
        },
      });

      if (newAttempts >= maxAttempts) {
        throw new Error("Too many incorrect attempts. Please request a new verification code.");
      }

      throw new Error("Incorrect verification code. Please check your email and try again.");
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

    const userSession: UserSession = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      emailVerified: true,
      firstName: user.profile?.firstName || "User",
      lastName: user.profile?.lastName || "",
    };

    const redirectPath = `/${user.role.toLowerCase()}/dashboard`;

    return {
      success: true,
      message: "Email successfully verified!",
      user: userSession,
      redirectPath,
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
      include: { user: { include: { profile: true } } },
    });

    if (!record) {
      throw new Error("Invalid or expired verification link.");
    }

    if (record.user.emailVerified) {
      return { success: true, message: "Email is already verified.", alreadyVerified: true };
    }

    if (new Date() > record.expiresAt) {
      throw new Error("This verification code has expired. Please request a new code.");
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

    const userSession: UserSession = {
      id: record.userId,
      userId: record.userId,
      email: record.user.email,
      role: record.user.role as UserRole,
      emailVerified: true,
      firstName: record.user.profile?.firstName || "User",
      lastName: record.user.profile?.lastName || "",
    };

    const redirectPath = `/${record.user.role.toLowerCase()}/dashboard`;

    return {
      success: true,
      message: "Email successfully verified via verification link!",
      user: userSession,
      redirectPath,
    };
  }

  /**
   * Initiates forgot password reset token generation and Resend email dispatch.
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

    const baseUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    await EmailService.sendPasswordResetEmail({
      email: user.email,
      userName: user.profile?.firstName,
      resetUrl,
    });

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
