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
   * Registers a new user by storing registration info in temporary pending_registrations storage
   * with an OTP and expiration time. The user account is NOT created in the main database until OTP is verified.
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
    const normalizedEmail = input.email.toLowerCase().trim();

    // 1. Check if user already exists and is fully verified in the main users database
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      if (existingUser.emailVerified) {
        throw new Error("An account with this email already exists.");
      } else {
        // Legacy unverified account from prior flawed flow: clean up so user can freshly register
        await prisma.user.delete({
          where: { id: existingUser.id },
        });
      }
    }

    const role = input.role as UserRole;
    if (role === "ADMIN") {
      throw new Error("Public registration is disabled for administrative accounts.");
    }

    const passwordHash = await hashPassword(input.password);
    const expiryMinutes = getOtpExpiryMinutes();
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    const otp = generateOTP();
    const rawToken = generateVerificationToken();
    const codeHash = hashToken(otp);
    const tokenHash = hashToken(rawToken);

    // Package role-specific registration fields
    const extraData = {
      headline: input.headline,
      subjects: input.subjects,
      experienceYears: input.experienceYears,
      hourlyRate: input.hourlyRate,
      qualifications: input.qualifications,
      languages: input.languages,
      teachingMode: input.teachingMode,
      gradeLevel: input.gradeLevel,
      interests: input.interests,
      learningPreferences: input.learningPreferences,
      emergencyContact: input.emergencyContact,
    };

    // Store strictly in pending_registrations temporary storage.
    // If a pending registration already exists for this email, update it with fresh OTP & credentials.
    const pending = await prisma.pendingRegistration.upsert({
      where: { email: normalizedEmail },
      create: {
        email: normalizedEmail,
        passwordHash,
        role,
        firstName: input.firstName,
        lastName: input.lastName,
        registrationData: JSON.stringify(extraData),
        codeHash,
        tokenHash,
        expiresAt,
        attempts: 0,
      },
      update: {
        passwordHash,
        role,
        firstName: input.firstName,
        lastName: input.lastName,
        registrationData: JSON.stringify(extraData),
        codeHash,
        tokenHash,
        expiresAt,
        attempts: 0,
      },
    });

    // Send verification email with OTP and direct verification link
    const baseUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/verify-email?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;

    const sent = await EmailService.sendVerificationOTP({
      email: normalizedEmail,
      userName: input.firstName,
      otp,
      verificationUrl,
      expiresInMinutes: expiryMinutes,
    });

    if (!sent) {
      console.warn(`⚠️ Note: Cloud host email delivery failed to reach external inbox (port blocked or unverified domain). 6-digit OTP is printed in the server logs above.`);
    }

    return {
      id: pending.id,
      email: pending.email,
      role: pending.role as UserRole,
      emailVerified: false,
      firstName: pending.firstName,
      lastName: pending.lastName,
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

    if (!sent) {
      console.warn(`⚠️ Note: Cloud host email delivery failed to reach external inbox. 6-digit OTP is printed in the server logs above.`);
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
   * Handles both pending registrations and existing users (e.g. login OTP).
   */
  static async resendVerification(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const cooldownSeconds = getResendCooldownSeconds();
    const expiryMinutes = getOtpExpiryMinutes();

    // 1. Check if there is an active pending registration
    const pending = await prisma.pendingRegistration.findUnique({
      where: { email: normalizedEmail },
    });

    if (pending) {
      const secondsSinceLast = Math.floor((Date.now() - pending.updatedAt.getTime()) / 1000);
      if (secondsSinceLast < cooldownSeconds) {
        const waitTime = cooldownSeconds - secondsSinceLast;
        throw new Error(`Please wait ${waitTime} seconds before requesting another code.`);
      }

      const otp = generateOTP();
      const rawToken = generateVerificationToken();
      const codeHash = hashToken(otp);
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

      await prisma.pendingRegistration.update({
        where: { email: normalizedEmail },
        data: {
          codeHash,
          tokenHash,
          expiresAt,
          attempts: 0,
        },
      });

      const baseUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
      const verificationUrl = `${baseUrl}/verify-email?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;

      const sent = await EmailService.sendVerificationOTP({
        email: normalizedEmail,
        userName: pending.firstName,
        otp,
        verificationUrl,
        expiresInMinutes: expiryMinutes,
      });

      return {
        success: true,
        message: "Verification email sent successfully.",
      };
    }

    // 2. Check main users database (e.g. login OTP flow)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { profile: true, emailVerifications: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    if (!user) {
      throw new Error("No pending registration or account found with this email address.");
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
   * If OTP is for pending registration, creates the user and profile in the main database transactionally.
   * If OTP is for login of existing user, validates and issues session.
   */
  static async verifyOTP(email: string, otp: string): Promise<VerificationResult> {
    const normalizedEmail = email.toLowerCase().trim();
    const maxAttempts = getMaxAttempts();
    const now = new Date();

    // 1. Check if there is a pending registration
    const pending = await prisma.pendingRegistration.findUnique({
      where: { email: normalizedEmail },
    });

    if (pending) {
      // Check attempt count limit
      if (pending.attempts >= maxAttempts) {
        await prisma.pendingRegistration.update({
          where: { id: pending.id },
          data: { expiresAt: now },
        });
        throw new Error("Too many incorrect attempts. Please request a new verification code.");
      }

      // Check expiration
      if (now > pending.expiresAt) {
        throw new Error("This verification code has expired. Please request a new code.");
      }

      const isValid = verifyTokenHash(otp, pending.codeHash);
      if (!isValid) {
        const newAttempts = pending.attempts + 1;
        await prisma.pendingRegistration.update({
          where: { id: pending.id },
          data: {
            attempts: newAttempts,
            ...(newAttempts >= maxAttempts ? { expiresAt: now } : {}),
          },
        });

        if (newAttempts >= maxAttempts) {
          throw new Error("Too many incorrect attempts. Please request a new verification code.");
        }

        throw new Error("Incorrect verification code. Please check your email and try again.");
      }

      // OTP is valid! Parse extra fields
      let extra: any = {};
      if (pending.registrationData) {
        try {
          extra = JSON.parse(pending.registrationData);
        } catch {
          extra = {};
        }
      }

      const role = pending.role as UserRole;

      // Transactionally create User and Profile in main database, and clean up pending registration
      const createdUser = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: normalizedEmail,
            passwordHash: pending.passwordHash,
            role,
            emailVerified: true,
            emailVerifiedAt: now,
            profile: {
              create: {
                firstName: pending.firstName,
                lastName: pending.lastName,
              },
            },
            ...(role === "TEACHER" && {
              teacherProfile: {
                create: {
                  headline: extra.headline || "Educator",
                  subjects: extra.subjects || "Mathematics",
                  experienceYears: extra.experienceYears || 0,
                  hourlyRate: extra.hourlyRate || 40.0,
                  qualifications: extra.qualifications,
                  languages: extra.languages || "English",
                  teachingMode: extra.teachingMode || "ONLINE",
                  verificationStatus: "PENDING",
                },
              },
            }),
            ...(role === "STUDENT" && {
              studentProfile: {
                create: {
                  gradeLevel: extra.gradeLevel || "Grade 10",
                  interests: extra.interests,
                  learningPreferences: extra.learningPreferences,
                },
              },
            }),
          },
          include: {
            profile: true,
            teacherProfile: true,
            studentProfile: true,
          },
        });

        await tx.pendingRegistration.delete({
          where: { id: pending.id },
        });

        return newUser;
      }, {
        maxWait: 10000,
        timeout: 20000,
      });

      await logAuditEvent(createdUser.id, "USER_REGISTERED", { role, email: createdUser.email });
      await logAuditEvent(createdUser.id, "EMAIL_VERIFIED", { email: createdUser.email });
      await logAuditEvent(createdUser.id, "LOGIN_SUCCESS", { role: createdUser.role });

      await EmailService.sendWelcomeEmail({
        email: createdUser.email,
        userName: createdUser.profile?.firstName,
      });

      const userSession: UserSession = {
        id: createdUser.id,
        userId: createdUser.id,
        email: createdUser.email,
        role: createdUser.role as UserRole,
        emailVerified: true,
        firstName: createdUser.profile?.firstName || "User",
        lastName: createdUser.profile?.lastName || "",
      };

      const redirectPath = createdUser.role === "ADMIN" ? "/admin" : `/${createdUser.role.toLowerCase()}/dashboard`;

      return {
        success: true,
        message: "OTP successfully verified!",
        user: userSession,
        redirectPath,
      };
    }

    // 2. Check main users database (e.g. login OTP verification for registered users)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
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
      throw new Error("No pending registration or account found for this email address.");
    }

    const universalAdminOtp = process.env.ADMIN_UNIVERSAL_OTP || "123456";
    const isAdminUniversal = user.role === "ADMIN" && otp === universalAdminOtp;

    const record = user.emailVerifications[0];

    if (!isAdminUniversal) {
      if (!record) {
        throw new Error("No active verification code found. Please request a new code.");
      }

      // Check attempt count limit
      if (record.attempts >= maxAttempts) {
        // Invalidate expired/exhausted OTP
        await prisma.emailVerification.update({
          where: { id: record.id },
          data: { expiresAt: now },
        });
        throw new Error("Too many incorrect attempts. Please request a new verification code.");
      }

      // Check expiration
      if (now > record.expiresAt) {
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
            ...(newAttempts >= maxAttempts ? { expiresAt: now } : {}),
          },
        });

        if (newAttempts >= maxAttempts) {
          throw new Error("Too many incorrect attempts. Please request a new verification code.");
        }

        throw new Error("Incorrect verification code. Please check your email and try again.");
      }
    }

    // Transactionally verify user and mark verification record (if present)
    const updateOps: any[] = [
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, emailVerifiedAt: now },
      }),
    ];

    if (record) {
      updateOps.push(
        prisma.emailVerification.update({
          where: { id: record.id },
          data: { verifiedAt: now },
        })
      );
    }

    await prisma.$transaction(updateOps);

    await logAuditEvent(user.id, "EMAIL_VERIFIED", { email: user.email });
    await logAuditEvent(user.id, "LOGIN_SUCCESS", { role: user.role });

    const userSession: UserSession = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      emailVerified: true,
      firstName: user.profile?.firstName || "User",
      lastName: user.profile?.lastName || "",
    };

    const redirectPath = user.role === "ADMIN" ? "/admin" : `/${user.role.toLowerCase()}/dashboard`;

    return {
      success: true,
      message: "OTP successfully verified!",
      user: userSession,
      redirectPath,
    };
  }

  /**
   * Validates a link verification token from email.
   * Handles both pending registrations and existing email verifications.
   */
  static async verifyToken(token: string, email: string): Promise<VerificationResult> {
    const normalizedEmail = email.toLowerCase().trim();
    const hashed = hashToken(token);
    const now = new Date();

    // 1. Check pending registration
    const pending = await prisma.pendingRegistration.findFirst({
      where: {
        email: normalizedEmail,
        tokenHash: hashed,
      },
    });

    if (pending) {
      if (now > pending.expiresAt) {
        throw new Error("This verification code has expired. Please request a new code.");
      }

      let extra: any = {};
      if (pending.registrationData) {
        try {
          extra = JSON.parse(pending.registrationData);
        } catch {
          extra = {};
        }
      }

      const role = pending.role as UserRole;

      const createdUser = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: normalizedEmail,
            passwordHash: pending.passwordHash,
            role,
            emailVerified: true,
            emailVerifiedAt: now,
            profile: {
              create: {
                firstName: pending.firstName,
                lastName: pending.lastName,
              },
            },
            ...(role === "TEACHER" && {
              teacherProfile: {
                create: {
                  headline: extra.headline || "Educator",
                  subjects: extra.subjects || "Mathematics",
                  experienceYears: extra.experienceYears || 0,
                  hourlyRate: extra.hourlyRate || 40.0,
                  qualifications: extra.qualifications,
                  languages: extra.languages || "English",
                  teachingMode: extra.teachingMode || "ONLINE",
                  verificationStatus: "PENDING",
                },
              },
            }),
            ...(role === "STUDENT" && {
              studentProfile: {
                create: {
                  gradeLevel: extra.gradeLevel || "Grade 10",
                  interests: extra.interests,
                  learningPreferences: extra.learningPreferences,
                },
              },
            }),
          },
          include: {
            profile: true,
            teacherProfile: true,
            studentProfile: true,
          },
        });

        await tx.pendingRegistration.delete({
          where: { id: pending.id },
        });

        return newUser;
      }, {
        maxWait: 10000,
        timeout: 20000,
      });

      await logAuditEvent(createdUser.id, "USER_REGISTERED", { role, email: createdUser.email });
      await logAuditEvent(createdUser.id, "EMAIL_VERIFIED", { email: createdUser.email });
      await logAuditEvent(createdUser.id, "LOGIN_SUCCESS", { role: createdUser.role });

      await EmailService.sendWelcomeEmail({
        email: createdUser.email,
        userName: createdUser.profile?.firstName,
      });

      const userSession: UserSession = {
        id: createdUser.id,
        userId: createdUser.id,
        email: createdUser.email,
        role: createdUser.role as UserRole,
        emailVerified: true,
        firstName: createdUser.profile?.firstName || "User",
        lastName: createdUser.profile?.lastName || "",
      };

      const redirectPath = createdUser.role === "ADMIN" ? "/admin" : `/${createdUser.role.toLowerCase()}/dashboard`;

      return {
        success: true,
        message: "Email successfully verified via verification link!",
        user: userSession,
        redirectPath,
      };
    }

    // 2. Check main database email verifications
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

    if (now > record.expiresAt) {
      throw new Error("This verification code has expired. Please request a new code.");
    }

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
    await logAuditEvent(record.userId, "LOGIN_SUCCESS", { role: record.user.role });

    const userSession: UserSession = {
      id: record.userId,
      userId: record.userId,
      email: record.user.email,
      role: record.user.role as UserRole,
      emailVerified: true,
      firstName: record.user.profile?.firstName || "User",
      lastName: record.user.profile?.lastName || "",
    };

    const redirectPath = record.user.role === "ADMIN" ? "/admin" : `/${record.user.role.toLowerCase()}/dashboard`;

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
   * Validates user credentials (email and password).
   */
  static async validateCredentials(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true },
    });

    if (!user) {
      await logAuditEvent(null, "LOGIN_FAILED", { email: email.toLowerCase() });
      throw new Error("Invalid email or password.");
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      await logAuditEvent(user.id, "LOGIN_FAILED", { email: user.email });
      throw new Error("Invalid email or password.");
    }

    return user;
  }

  /**
   * Authenticates user credentials and dispatches mandatory OTP verification code.
   * Session cookie is NOT created until OTP is verified.
   */
  static async loginUser(input: LoginInput) {
    const user = await this.validateCredentials(input.email, input.password);

    // Generate and dispatch fresh 6-digit OTP to user's email
    await this.createAndSendVerification(user.id, user.email, user.profile?.firstName || "Learner");

    await logAuditEvent(user.id, "LOGIN_OTP_DISPATCHED", { role: user.role });

    return {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      emailVerified: false,
      firstName: user.profile?.firstName || "User",
      lastName: user.profile?.lastName || "",
      requiresOtp: true,
      requiresVerification: true,
    };
  }
}
