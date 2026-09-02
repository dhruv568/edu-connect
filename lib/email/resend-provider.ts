import { Resend } from "resend";
import { IEmailProvider, SendEmailPayload, SendPasswordResetPayload } from "./email-service";
import { generateVerificationEmailHtml } from "./templates/verification-email";
import { generatePasswordResetEmailHtml } from "./templates/password-reset-email";
import { generateNotificationEmailHtml, NotificationEmailParams } from "./templates/verification-templates";

export class ResendEmailProvider implements IEmailProvider {
  name = "Resend (Production Transactional Email)";
  private resend: Resend;
  private defaultFrom: string;
  private domainId?: string;
  private smtpFallback?: IEmailProvider;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY || "";
    this.resend = new Resend(apiKey);
    this.domainId = process.env.RESEND_DOMAIN_ID;

    const fromName = process.env.RESEND_FROM_NAME || "EduConnect";
    let fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    
    // If using placeholder or non-custom sender, fallback to Resend onboarding sender
    if (fromEmail.includes("no-reply@educonnect.com") || fromEmail.includes("example.com") || fromEmail.includes("@gmail.com")) {
      fromEmail = "onboarding@resend.dev";
    }
    
    if (fromEmail.includes("<")) {
      this.defaultFrom = fromEmail;
    } else {
      this.defaultFrom = `${fromName} <${fromEmail}>`;
    }

    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      try {
        const { SMTPEmailProvider } = require("./email-service");
        this.smtpFallback = new SMTPEmailProvider();
      } catch {
        // Handled
      }
    }
  }

  private getCustomHeaders(): Record<string, string> | undefined {
    if (this.domainId) {
      return {
        "X-Resend-Domain-Id": this.domainId,
      };
    }
    return undefined;
  }

  async sendVerificationEmail(payload: SendEmailPayload): Promise<boolean> {
    try {
      const html = generateVerificationEmailHtml(payload.templateParams);
      const subject = payload.subject || "Your EduConnect Verification Code 🎓";
      const headers = this.getCustomHeaders();

      const { data, error } = await this.resend.emails.send({
        from: this.defaultFrom,
        to: payload.to,
        subject: subject,
        html: html,
        ...(headers ? { headers } : {}),
      });

      if (!error && data?.id) {
        console.log(`✅ [Resend] Verification email delivered to ${payload.to} (ID: ${data.id})`);
        return true;
      }

      console.warn(`⚠️ [Resend API Error]: ${error?.message || "Delivery rejected"}`);
      if (this.smtpFallback) {
        console.log(`🔄 Attempting SMTP fallback for ${payload.to}...`);
        return await this.smtpFallback.sendVerificationEmail(payload);
      }
      return false;
    } catch (err: any) {
      console.error("❌ Unexpected error in ResendEmailProvider.sendVerificationEmail:", err.message || err);
      if (this.smtpFallback) {
        return await this.smtpFallback.sendVerificationEmail(payload);
      }
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
      const subject = payload.subject || "Reset your EduConnect password";
      const headers = this.getCustomHeaders();

      const { data, error } = await this.resend.emails.send({
        from: this.defaultFrom,
        to: payload.to,
        subject: subject,
        html: html,
        ...(headers ? { headers } : {}),
      });

      if (!error && data?.id) {
        console.log(`✅ [Resend] Password reset email delivered to ${payload.to} (ID: ${data.id})`);
        return true;
      }

      console.warn(`⚠️ [Resend API Error]: ${error?.message || "Delivery rejected"}`);
      if (this.smtpFallback) {
        return await this.smtpFallback.sendPasswordResetEmail(payload);
      }
      return false;
    } catch (err: any) {
      console.error("❌ Unexpected error in ResendEmailProvider.sendPasswordResetEmail:", err.message || err);
      if (this.smtpFallback) {
        return await this.smtpFallback.sendPasswordResetEmail(payload);
      }
      return false;
    }
  }

  async sendNotificationEmail(params: NotificationEmailParams): Promise<boolean> {
    try {
      const html = generateNotificationEmailHtml(params);
      const headers = this.getCustomHeaders();

      const { data, error } = await this.resend.emails.send({
        from: this.defaultFrom,
        to: params.email,
        subject: params.subject,
        html: html,
        ...(headers ? { headers } : {}),
      });

      if (!error && data?.id) {
        console.log(`✅ [Resend] Notification email delivered to ${params.email} (ID: ${data.id})`);
        return true;
      }

      console.warn(`⚠️ [Resend API Error]: ${error?.message || "Delivery rejected"}`);
      if (this.smtpFallback) {
        return await this.smtpFallback.sendNotificationEmail(params);
      }
      return false;
    } catch (err: any) {
      console.error("❌ Unexpected error in ResendEmailProvider.sendNotificationEmail:", err.message || err);
      if (this.smtpFallback) {
        return await this.smtpFallback.sendNotificationEmail(params);
      }
      return false;
    }
  }
}
