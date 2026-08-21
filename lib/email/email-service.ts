import nodemailer from "nodemailer";
import { generateVerificationEmailHtml, EmailTemplateParams } from "./templates/verification-email";
import { generateNotificationEmailHtml, NotificationEmailParams } from "./templates/verification-templates";

export interface SendEmailPayload {
  to: string;
  subject: string;
  templateParams: EmailTemplateParams;
}

export interface IEmailProvider {
  name: string;
  sendVerificationEmail(payload: SendEmailPayload): Promise<boolean>;
  sendNotificationEmail(payload: NotificationEmailParams): Promise<boolean>;
}

/**
 * Development Console Email Provider.
 * Formats and outputs full verification details cleanly to console for local testing.
 */
export class ConsoleEmailProvider implements IEmailProvider {
  name = "Console (Development Logger)";

  async sendVerificationEmail(payload: SendEmailPayload): Promise<boolean> {
    const { to, templateParams } = payload;
    console.log("\n==================================================");
    console.log("✉️ [EMAIL PROVIDER: CONSOLE LOG]");
    console.log(`To: ${to}`);
    console.log(`Subject: Verify your EduConnect email`);
    console.log(`Recipient: ${templateParams.firstName}`);
    console.log(`🔑 6-Digit OTP: >>> ${templateParams.otp} <<<`);
    console.log(`🔗 Direct URL:  ${templateParams.verificationUrl}`);
    console.log(`⏱️ Expiry:      ${templateParams.expiresInMinutes} minutes`);
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
    console.log(`Body: ${params.bodyText}`);
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
        from: process.env.EMAIL_FROM || "no-reply@educonnect.com",
        to: payload.to,
        subject: payload.subject,
        html: html,
      });
      return true;
    } catch (error) {
      console.error("❌ SMTP Delivery Error:", error);
      return false;
    }
  }

  async sendNotificationEmail(params: NotificationEmailParams): Promise<boolean> {
    try {
      const html = generateNotificationEmailHtml(params);
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || "no-reply@educonnect.com",
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
 */
export function getEmailProvider(): IEmailProvider {
  const providerType = process.env.EMAIL_PROVIDER?.toLowerCase() || "console";
  if (providerType === "smtp") {
    return new SMTPEmailProvider();
  }
  return new ConsoleEmailProvider();
}
