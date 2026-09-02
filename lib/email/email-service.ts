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
 * Configured with strict timeouts to prevent hanging on cloud hosts (e.g. Render free tier) that block SMTP ports.
 */
export class SMTPEmailProvider implements IEmailProvider {
  name = "SMTP (Nodemailer)";
  private transporter: nodemailer.Transporter;

  constructor() {
    const port = Number(process.env.SMTP_PORT) || 587;
    const isSecure = process.env.SMTP_SECURE === "true" || port === 465;

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: port,
      secure: isSecure,
      connectionTimeout: 4000, // 4 seconds max connection timeout
      greetingTimeout: 4000,   // 4 seconds max greeting timeout
      socketTimeout: 5000,     // 5 seconds max socket timeout
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.replace(/\s+/g, "") : "",
      },
    });
  }

  async sendVerificationEmail(payload: SendEmailPayload): Promise<boolean> {
    try {
      const html = generateVerificationEmailHtml(payload.templateParams);
      const from = process.env.EMAIL_FROM || (process.env.SMTP_USER ? `EduConnect <${process.env.SMTP_USER}>` : "EduConnect <no-reply@educonnect.com>");
      await Promise.race([
        this.transporter.sendMail({
          from: from,
          to: payload.to,
          subject: payload.subject || "Your EduConnect Verification Code 🎓",
          html: html,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("SMTP connection timed out after 4000ms")), 4000)
        ),
      ]);
      return true;
    } catch (error: any) {
      console.error("❌ SMTP Delivery Error:", error?.message || error);
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
      const from = process.env.EMAIL_FROM || (process.env.SMTP_USER ? `EduConnect <${process.env.SMTP_USER}>` : "EduConnect <no-reply@educonnect.com>");
      await Promise.race([
        this.transporter.sendMail({
          from: from,
          to: payload.to,
          subject: payload.subject || "Reset your EduConnect password",
          html: html,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("SMTP password reset timed out after 4000ms")), 4000)
        ),
      ]);
      return true;
    } catch (error: any) {
      console.error("❌ SMTP Password Reset Error:", error?.message || error);
      return false;
    }
  }

  async sendNotificationEmail(params: NotificationEmailParams): Promise<boolean> {
    try {
      const html = generateNotificationEmailHtml(params);
      const from = process.env.EMAIL_FROM || (process.env.SMTP_USER ? `EduConnect <${process.env.SMTP_USER}>` : "EduConnect <no-reply@educonnect.com>");
      await Promise.race([
        this.transporter.sendMail({
          from: from,
          to: params.email,
          subject: params.subject,
          html: html,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("SMTP notification timed out after 4000ms")), 4000)
        ),
      ]);
      return true;
    } catch (error: any) {
      console.error("❌ SMTP Notification Error:", error?.message || error);
      return false;
    }
  }
}

/**
 * Resilient Smart Multi-Provider.
 * 1. Always logs OTP to server console (critical for cloud hosts like Render that block SMTP).
 * 2. Tries Resend over HTTPS port 443 first (never blocked by cloud firewalls).
 * 3. Falls back to SMTP with strict 4s timeout (succeeds on localhost/VPS, fails fast on blocked hosts).
 */
export class SmartEmailProvider implements IEmailProvider {
  name = "Smart Multi-Provider (Resend + SMTP Fallback)";
  private resendProvider?: IEmailProvider;
  private smtpProvider?: SMTPEmailProvider;

  constructor() {
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim() !== "") {
      try {
        const { ResendEmailProvider } = require("./resend-provider");
        this.resendProvider = new ResendEmailProvider();
      } catch (err) {
        console.warn("⚠️ Could not load ResendEmailProvider:", err);
      }
    }

    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      try {
        this.smtpProvider = new SMTPEmailProvider();
      } catch (err) {
        console.warn("⚠️ Could not load SMTPEmailProvider:", err);
      }
    }
  }

  async sendVerificationEmail(payload: SendEmailPayload): Promise<boolean> {
    // ALWAYS print OTP to server console (ensures developer/user on Render can retrieve it)
    console.log("\n==================================================");
    console.log("✉️ [EDUCONNECT OTP DISPATCH]");
    console.log(`To: ${payload.to}`);
    console.log(`Recipient: ${payload.templateParams.firstName || "Learner"}`);
    console.log(`🔑 6-Digit OTP: >>> ${payload.templateParams.otp} <<<`);
    if (payload.templateParams.verificationUrl) {
      console.log(`Verification URL: ${payload.templateParams.verificationUrl}`);
    }
    console.log(`⏱️ Expiry: ${payload.templateParams.expiresInMinutes || 10} minutes`);
    console.log("==================================================\n");

    // 1. Try Resend via HTTPS (port 443 - never blocked by cloud firewalls)
    if (this.resendProvider) {
      try {
        let resendTimer: NodeJS.Timeout | undefined;
        const resendTimeout = new Promise<boolean>((resolve) => {
          resendTimer = setTimeout(() => resolve(false), 3500);
        });
        const sent = await Promise.race([
          this.resendProvider.sendVerificationEmail(payload),
          resendTimeout,
        ]);
        if (resendTimer) clearTimeout(resendTimer);
        if (sent) {
          console.log(`✅ Verification email successfully delivered via Resend to ${payload.to}`);
          return true;
        }
      } catch (err: any) {
        console.warn(`⚠️ Resend attempt failed (${err?.message || err}). Trying SMTP fallback...`);
      }
    }

    // 2. Try SMTP fallback (with strict 4s timeout)
    if (this.smtpProvider) {
      try {
        const sent = await this.smtpProvider.sendVerificationEmail(payload);
        if (sent) {
          console.log(`✅ Verification email successfully delivered via SMTP to ${payload.to}`);
          return true;
        }
      } catch (err: any) {
        console.warn(`⚠️ SMTP attempt failed (${err?.message || err}).`);
      }
    }

    console.warn(`⚠️ Cloud email delivery restricted (port blocked or domain unverified). OTP is printed above in server logs.`);
    return false;
  }

  async sendPasswordResetEmail(payload: SendPasswordResetPayload): Promise<boolean> {
    console.log("\n==================================================");
    console.log("🔑 [EDUCONNECT PASSWORD RESET DISPATCH]");
    console.log(`To: ${payload.to}`);
    console.log(`Reset URL: ${payload.resetUrl}`);
    console.log("==================================================\n");

    if (this.resendProvider) {
      try {
        const sent = await this.resendProvider.sendPasswordResetEmail(payload);
        if (sent) return true;
      } catch (err) {
        // Fall back to SMTP
      }
    }

    if (this.smtpProvider) {
      try {
        const sent = await this.smtpProvider.sendPasswordResetEmail(payload);
        if (sent) return true;
      } catch (err) {
        // Handled
      }
    }

    return false;
  }

  async sendNotificationEmail(params: NotificationEmailParams): Promise<boolean> {
    if (this.resendProvider) {
      try {
        const sent = await this.resendProvider.sendNotificationEmail(params);
        if (sent) return true;
      } catch (err) {
        // Fall back to SMTP
      }
    }

    if (this.smtpProvider) {
      try {
        const sent = await this.smtpProvider.sendNotificationEmail(params);
        if (sent) return true;
      } catch (err) {
        // Handled
      }
    }

    return false;
  }
}

/**
 * Factory function returning configured Email Provider based on environment variables.
 */
export function getEmailProvider(): IEmailProvider {
  const providerType = process.env.EMAIL_PROVIDER?.toLowerCase() || "";

  if (providerType === "console") {
    return new ConsoleEmailProvider();
  }

  if (providerType === "smtp") {
    return new SMTPEmailProvider();
  }

  if (providerType === "resend") {
    const { ResendEmailProvider } = require("./resend-provider");
    return new ResendEmailProvider();
  }

  // Default to Smart Multi-Provider for maximum resilience across local, Render, Vercel
  return new SmartEmailProvider();
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
    try {
      let timer: NodeJS.Timeout | undefined;
      const timeoutPromise = new Promise<boolean>((resolve) => {
        timer = setTimeout(() => {
          console.warn("⏱️ Email dispatch safety timeout reached (4500ms). Responding to UI.");
          resolve(false);
        }, 4500);
      });

      const result = await Promise.race([
        provider.sendVerificationEmail({
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
        }),
        timeoutPromise,
      ]);

      if (timer) clearTimeout(timer);
      return result;
    } catch (err) {
      console.error("❌ EmailService.sendVerificationOTP error:", err);
      return false;
    }
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
      statusBadgeVariant: "success",
      headline: "Your EduConnect journey starts here!",
      bodyText: "Explore top teachers, host live classes, and master new skills on EduConnect.",
    });
  }
}
