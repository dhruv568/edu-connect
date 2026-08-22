import nodemailer from "nodemailer";
import { generateVerificationEmailHtml, EmailTemplateParams } from "./templates/verification-email";
import { generateNotificationEmailHtml, NotificationEmailParams } from "./templates/verification-templates";
import { generatePasswordResetEmailHtml, PasswordResetEmailParams } from "./templates/password-reset-email";

export interface SendEmailPayload {
  to: string;
  subject: string;
  templateParams: EmailTemplateParams;
}

export interface SendPasswordResetPayload {
  to: string;
  subject: string;
  firstName?: string;
  resetUrl: string;
}

export interface IEmailProvider {
  name: string;
  sendVerificationEmail(payload: SendEmailPayload): Promise<boolean>;
  sendPasswordResetEmail(payload: SendPasswordResetPayload): Promise<boolean>;
  sendNotificationEmail(payload: NotificationEmailParams): Promise<boolean>;
}

/**
 * Development / Test Console Email Provider.
 * Safely outputs verification dispatches. In test/dev mode, displays details for test assertions.
 */
export class ConsoleEmailProvider implements IEmailProvider {
  name = "Console (Development Logger)";

  async sendVerificationEmail(payload: SendEmailPayload): Promise<boolean> {
    const { to, templateParams } = payload;
    const isProduction = process.env.NODE_ENV === "production";

    console.log("\n==================================================");
    console.log("✉️ [EMAIL SERVICE: VERIFICATION DISPATCH]");
    console.log(`To: ${to}`);
    console.log(`Subject: ${payload.subject || "Your EduConnect Verification Code 🎓"}`);
    console.log(`Recipient: ${templateParams.firstName || "User"}`);
    if (!isProduction) {
      console.log(`🔑 6-Digit OTP: >>> ${templateParams.otp} <<<`);
    } else {
      console.log(`🔑 6-Digit OTP: [REDACTED IN PRODUCTION LOGS]`);
    }
    console.log(`⏱️ Expiry:      ${templateParams.expiresInMinutes || 10} minutes`);
    console.log("==================================================\n");
    return true;
  }

  async sendPasswordResetEmail(payload: SendPasswordResetPayload): Promise<boolean> {
    const isProduction = process.env.NODE_ENV === "production";
    console.log("\n==================================================");
    console.log("🔑 [EMAIL SERVICE: PASSWORD RESET DISPATCH]");
    console.log(`To: ${payload.to}`);
    if (!isProduction) {
      console.log(`Reset URL: ${payload.resetUrl}`);
    } else {
      console.log(`Reset URL: [REDACTED IN PRODUCTION LOGS]`);
    }
    console.log("==================================================\n");
    return true;
  }

  async sendNotificationEmail(params: NotificationEmailParams): Promise<boolean> {
    console.log("\n==================================================");
    console.log("✉️ [EMAIL NOTIFICATION: CONSOLE LOG]");
    console.log(`To: ${params.email}`);
    console.log(`Subject: ${params.subject}`);
    console.log(`Recipient: ${params.recipientName}`);
    console.log(`Status Badge: [${params.statusBadgeText}]`);
    console.log(`Headline: ${params.headline}`);
    if (params.reasonText) console.log(`Reason: ${params.reasonText}`);
    console.log("==================================================\n");
    return true;
  }
}

/**
 * SMTP Email Provider powered by Nodemailer.
 */
export class SMTPEmailProvider implements IEmailProvider {
  name = "SMTP (Nodemailer)";
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "localhost",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASSWORD || "",
      },
    });
  }

  async sendVerificationEmail(payload: SendEmailPayload): Promise<boolean> {
    try {
      const html = generateVerificationEmailHtml(payload.templateParams);
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || "EduConnect <no-reply@educonnect.com>",
        to: payload.to,
        subject: payload.subject || "Your EduConnect Verification Code 🎓",
        html: html,
      });
      return true;
    } catch (error) {
      console.error("❌ SMTP Delivery Error:", error);
      return false;
    }
  }

  async sendPasswordResetEmail(payload: SendPasswordResetPayload): Promise<boolean> {
    try {
      const html = generatePasswordResetEmailHtml({
        recipientEmail: payload.to,
        firstName: payload.firstName,
        resetUrl: payload.resetUrl,
      });
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || "EduConnect <no-reply@educonnect.com>",
        to: payload.to,
        subject: payload.subject || "Reset your EduConnect password",
        html: html,
      });
      return true;
    } catch (error) {
      console.error("❌ SMTP Password Reset Error:", error);
      return false;
    }
  }

  async sendNotificationEmail(params: NotificationEmailParams): Promise<boolean> {
    try {
      const html = generateNotificationEmailHtml(params);
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || "EduConnect <no-reply@educonnect.com>",
        to: params.email,
        subject: params.subject,
        html: html,
      });
      return true;
    } catch (error) {
      console.error("❌ SMTP Notification Error:", error);
      return false;
    }
  }
}

/**
 * Factory function returning configured Email Provider based on environment variables.
 * Prioritizes Resend whenever RESEND_API_KEY is present or EMAIL_PROVIDER="resend".
 */
export function getEmailProvider(): IEmailProvider {
  const providerType = process.env.EMAIL_PROVIDER?.toLowerCase() || "";
  const hasResendKey = !!(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim() !== "");

  if (providerType === "resend" || (hasResendKey && providerType !== "console")) {
    // Dynamic require/import to instantiate ResendEmailProvider
    const { ResendEmailProvider } = require("./resend-provider");
    return new ResendEmailProvider();
  }

  if (providerType === "smtp") {
    return new SMTPEmailProvider();
  }

  return new ConsoleEmailProvider();
}

/**
 * Higher-level EduConnect Email Service API wrappers.
 */
export class EmailService {
  static async sendVerificationOTP(params: {
    email: string;
    userName?: string;
    otp: string;
    verificationUrl?: string;
    expiresInMinutes?: number;
  }): Promise<boolean> {
    const provider = getEmailProvider();
    return provider.sendVerificationEmail({
      to: params.email,
      subject: "Your EduConnect Verification Code 🎓",
      templateParams: {
        recipientEmail: params.email,
        firstName: params.userName,
        otp: params.otp,
        verificationUrl: params.verificationUrl,
        expiresInMinutes: params.expiresInMinutes || Number(process.env.OTP_EXPIRY_MINUTES) || 10,
        appUrl: process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
      },
    });
  }

  static async sendPasswordResetEmail(params: {
    email: string;
    userName?: string;
    resetUrl: string;
  }): Promise<boolean> {
    const provider = getEmailProvider();
    return provider.sendPasswordResetEmail({
      to: params.email,
      subject: "Reset your EduConnect password",
      firstName: params.userName,
      resetUrl: params.resetUrl,
    });
  }

  static async sendWelcomeEmail(params: {
    email: string;
    userName?: string;
  }): Promise<boolean> {
    const provider = getEmailProvider();
    return provider.sendNotificationEmail({
      email: params.email,
      recipientName: params.userName || "Learner",
      subject: "Welcome to EduConnect! 🎓",
      statusBadgeText: "WELCOME",
      headline: "Your EduConnect journey starts here!",
      bodyText: "Explore top teachers, host live classes, and master new skills on EduConnect.",
    });
  }
}
