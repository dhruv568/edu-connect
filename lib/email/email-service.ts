import dns from "node:dns";
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Ignored in environments that do not support this call
}

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
 * Robust SMTP delivery with dual-port failover (Port 465 SSL <-> Port 587 STARTTLS)
 * and IPv4 priority to ensure delivery on all environments.
 */
export class SMTPEmailProvider implements IEmailProvider {
  name = "SMTP (Nodemailer)";
  private transporter: nodemailer.Transporter;
  private fallbackTransporter?: nodemailer.Transporter;

  constructor() {
    const configuredPort = Number(process.env.SMTP_PORT) || 465;
    const isSecure = process.env.SMTP_SECURE === "true" || configuredPort === 465;
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const user = process.env.SMTP_USER || "";
    const pass = process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.replace(/\s+/g, "") : "";

    this.transporter = nodemailer.createTransport({
      host,
      port: configuredPort,
      secure: isSecure,
      auth: { user, pass },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
      tls: { rejectUnauthorized: false },
    });

    // Automatic alternate port fallback (465 SSL <-> 587 STARTTLS)
    const altPort = configuredPort === 465 ? 587 : 465;
    this.fallbackTransporter = nodemailer.createTransport({
      host,
      port: altPort,
      secure: altPort === 465,
      requireTLS: altPort === 587,
      auth: { user, pass },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
      tls: { rejectUnauthorized: false },
    });
  }

  async sendVerificationEmail(payload: SendEmailPayload): Promise<boolean> {
    const html = generateVerificationEmailHtml(payload.templateParams);
    const from = process.env.EMAIL_FROM || (process.env.SMTP_USER ? `EduConnect <${process.env.SMTP_USER}>` : "EduConnect <no-reply@educonnect.com>");
    const mailOptions = {
      from,
      to: payload.to,
      subject: payload.subject || "Your EduConnect Verification Code 🎓",
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ [SMTP] Verification code email sent to ${payload.to}`);
      return true;
    } catch (primaryErr: any) {
      console.warn(`⚠️ [SMTP] Primary port failed (${primaryErr?.message || primaryErr}). Trying alternate port...`);
      if (this.fallbackTransporter) {
        try {
          await this.fallbackTransporter.sendMail(mailOptions);
          console.log(`✅ [SMTP] Verification code email sent to ${payload.to} via fallback port`);
          return true;
        } catch (altErr: any) {
          console.error(`❌ [SMTP Delivery Error]:`, altErr?.message || altErr);
          return false;
        }
      }
      return false;
    }
  }

  async sendPasswordResetEmail(payload: SendPasswordResetPayload): Promise<boolean> {
    const html = generatePasswordResetEmailHtml({
      recipientEmail: payload.to,
      firstName: payload.firstName,
      resetUrl: payload.resetUrl,
    });
    const from = process.env.EMAIL_FROM || (process.env.SMTP_USER ? `EduConnect <${process.env.SMTP_USER}>` : "EduConnect <no-reply@educonnect.com>");
    const mailOptions = {
      from,
      to: payload.to,
      subject: payload.subject || "Reset your EduConnect password",
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ [SMTP] Password reset email sent to ${payload.to}`);
      return true;
    } catch (primaryErr: any) {
      if (this.fallbackTransporter) {
        try {
          await this.fallbackTransporter.sendMail(mailOptions);
          return true;
        } catch (altErr: any) {
          console.error(`❌ [SMTP Password Reset Error]:`, altErr?.message || altErr);
          return false;
        }
      }
      return false;
    }
  }

  async sendNotificationEmail(params: NotificationEmailParams): Promise<boolean> {
    const html = generateNotificationEmailHtml(params);
    const from = process.env.EMAIL_FROM || (process.env.SMTP_USER ? `EduConnect <${process.env.SMTP_USER}>` : "EduConnect <no-reply@educonnect.com>");
    const mailOptions = {
      from,
      to: params.email,
      subject: params.subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (primaryErr: any) {
      if (this.fallbackTransporter) {
        try {
          await this.fallbackTransporter.sendMail(mailOptions);
          return true;
        } catch (altErr: any) {
          console.error(`❌ [SMTP Notification Error]:`, altErr?.message || altErr);
          return false;
        }
      }
      return false;
    }
  }
}

/**
 * Factory function returning configured Email Provider based on environment variables.
 * Defaults to SMTPEmailProvider for full inbox delivery.
 */
export function getEmailProvider(): IEmailProvider {
  const providerType = process.env.EMAIL_PROVIDER?.toLowerCase() || "";
  const hasResendKey = !!(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim() !== "");

  if (providerType === "console") {
    return new ConsoleEmailProvider();
  }

  if (providerType === "smtp") {
    return new SMTPEmailProvider();
  }

  if (providerType === "resend" || hasResendKey) {
    const { ResendEmailProvider } = require("./resend-provider");
    return new ResendEmailProvider();
  }

  const { ResendEmailProvider } = require("./resend-provider");
  return new ResendEmailProvider();
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
          console.warn("⏱️ Email dispatch safety timeout reached (15000ms). Responding to UI.");
          resolve(false);
        }, 15000);
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
