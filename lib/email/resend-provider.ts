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

  constructor() {
    const apiKey = process.env.RESEND_API_KEY || "";
    this.resend = new Resend(apiKey);
    this.domainId = process.env.RESEND_DOMAIN_ID;

    const fromName = process.env.RESEND_FROM_NAME || "EduConnect";
    let fromEmail = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || "onboarding@resend.dev";
    
    // If using unverified placeholder domain, fallback to Resend onboarding sender
    if (fromEmail.includes("no-reply@educonnect.com") || fromEmail.includes("example.com")) {
      fromEmail = "onboarding@resend.dev";
    }
    
    if (fromEmail.includes("<")) {
      this.defaultFrom = fromEmail;
    } else {
      this.defaultFrom = `${fromName} <${fromEmail}>`;
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

      if (error) {
        console.error("❌ Resend API Error (Verification Email):", error.message || error);
        return false;
      }

      return true;
    } catch (err: any) {
      console.error("❌ Unexpected error in ResendEmailProvider.sendVerificationEmail:", err.message || err);
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

      if (error) {
        console.error("❌ Resend API Error (Password Reset Email):", error.message || error);
        return false;
      }

      return true;
    } catch (err: any) {
      console.error("❌ Unexpected error in ResendEmailProvider.sendPasswordResetEmail:", err.message || err);
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

      if (error) {
        console.error("❌ Resend API Error (Notification Email):", error.message || error);
        return false;
      }

      return true;
    } catch (err: any) {
      console.error("❌ Unexpected error in ResendEmailProvider.sendNotificationEmail:", err.message || err);
      return false;
    }
  }
}
