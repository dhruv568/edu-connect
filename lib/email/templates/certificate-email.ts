import { OFFICIAL_COMPANY_INFO } from "@/lib/company";
import { generateEmailFooterHtml } from "./email-footer";

export interface CertificateEmailParams {
  recipientEmail: string;
  educatorName: string;
  certificateNumber: string;
  programTitle: string;
  completionDate: string;
  verificationUrl: string;
  appUrl: string;
}

export function generateCertificateEmailHtml(params: CertificateEmailParams): string {
  const {
    educatorName,
    certificateNumber,
    programTitle,
    completionDate,
    verificationUrl,
    appUrl,
  } = params;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your EduConnects Completion Certificate</title>
  <style>
    @media screen and (max-width: 600px) {
      .footer-padding { padding: 20px 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F0FAF5; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F0FAF5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(22, 128, 91, 0.08); border: 1px solid #D1FAE5;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0D5C41 0%, #16805B 100%); padding: 36px 32px; text-align: center;">
              <div style="display: inline-block; padding: 8px 16px; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 999px; margin-bottom: 16px;">
                <span style="color: #A7F3D0; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                  ★ EDUCONNECTS ACADEMY ★
                </span>
              </div>
              <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; line-height: 1.25;">
                Congratulations, ${educatorName}!
              </h1>
              <p style="margin: 8px 0 0 0; color: #D1FAE5; font-size: 14px; font-weight: 500;">
                You have successfully graduated from the ${programTitle}
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                Dear <strong>${educatorName}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                We are thrilled to officially award you your <strong>EduConnects Verified Educator Certificate</strong>. You have demonstrated comprehensive mastery across all 15 training days, including live interactive delivery, curriculum architecture, formative assessment, and student engagement excellence.
              </p>

              <!-- Certificate Summary Card -->
              <table role="presentation" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; margin-bottom: 28px;">
                <tr>
                  <td>
                    <table role="presentation" width="100%">
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #64748B; font-weight: 600;">Program:</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #0F172A; font-weight: 700; text-align: right;">${programTitle}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #64748B; font-weight: 600;">Educator Name:</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #0F172A; font-weight: 700; text-align: right;">${educatorName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #64748B; font-weight: 600;">Date of Completion:</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #0F172A; font-weight: 700; text-align: right;">${completionDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #64748B; font-weight: 600;">Certificate ID:</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #16805B; font-weight: 800; text-align: right; font-family: monospace;">${certificateNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #64748B; font-weight: 600;">Status:</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #16805B; font-weight: 800; text-align: right;">VERIFIED &amp; ACTIVE</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Attachment Notification Notice -->
              <div style="background-color: #ECFDF5; border-left: 4px solid #10B981; padding: 14px 18px; border-radius: 8px; margin-bottom: 28px;">
                <p style="margin: 0; font-size: 13px; color: #065F46; font-weight: 600; line-height: 1.5;">
                  📎 <strong>Official PDF Attached:</strong> Your high-resolution printable PDF certificate is attached directly to this email for your professional portfolio.
                </p>
              </div>

              <!-- CTA Button -->
              <table role="presentation" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #16805B 0%, #0D5C41 100%); color: #FFFFFF; font-size: 15px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(22, 128, 91, 0.35);">
                      Verify Certificate Online →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; color: #64748B; text-align: center; line-height: 1.5;">
                Anyone can verify the authenticity of your certificate at:<br>
                <a href="${verificationUrl}" style="color: #16805B; font-weight: 600; word-break: break-all;">${verificationUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Standardized EduConnects Redesigned Footer -->
          ${generateEmailFooterHtml({ baseUrl: appUrl, isEducator: true })}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
