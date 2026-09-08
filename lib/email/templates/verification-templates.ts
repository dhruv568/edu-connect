export interface NotificationEmailParams {
  email: string;
  recipientName: string;
  subject: string;
  headline: string;
  bodyText: string;
  statusBadgeText: string;
  statusBadgeVariant: "pending" | "success" | "danger" | "warning" | "info";
  reasonText?: string;
  actionUrl?: string;
  actionText?: string;
  roleName?: string;
}

/**
 * Generates an ultra-clean, bulletproof, inline-styled transactional email template.
 * Fully compatible across all major email clients (Gmail, Outlook, Apple Mail, Yahoo, Mobile).
 */
export function generateNotificationEmailHtml(params: NotificationEmailParams): string {
  const badgeColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    pending: { bg: "#fef3c7", text: "#92400e", border: "#fde68a", dot: "#d97706" },
    success: { bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0", dot: "#10b981" },
    danger: { bg: "#fef2f2", text: "#991b1b", border: "#fecaca", dot: "#ef4444" },
    warning: { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa", dot: "#f97316" },
    info: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe", dot: "#3b82f6" },
  };

  const badgeStyle = badgeColors[params.statusBadgeVariant] || badgeColors.info;
  const currentYear = new Date().getFullYear();
  const recipient = params.recipientName && params.recipientName.trim() ? params.recipientName.trim() : "Colleague";

  // Clean and parse body text into formatted HTML blocks
  let rawBody = params.bodyText || "";

  // Remove redundant greeting if already at start of bodyText
  rawBody = rawBody.replace(/^Hello\s+[^,\n]+,\s*/i, "").trim();

  // Parse lines for role highlight, step lists, and paragraphs
  const paragraphs = rawBody.split(/\n\s*\n/).filter(Boolean);

  let formattedContentHtml = "";

  for (const para of paragraphs) {
    const trimmed = para.trim();

    // Check if paragraph is a numbered step list (e.g. "1. Open EduConnects\n2. Go to...")
    if (/^\d+\.\s+/m.test(trimmed)) {
      const stepLines = trimmed.split("\n").filter((l) => l.trim().length > 0);
      let stepsHtml = `<div style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px;">`;
      stepsHtml += `<div style="font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">Onboarding Steps:</div>`;
      stepsHtml += `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">`;

      stepLines.forEach((line) => {
        const match = line.match(/^(\d+)\.\s+(.*)$/);
        if (match) {
          const num = match[1];
          const text = match[2];
          stepsHtml += `
            <tr>
              <td valign="top" style="width: 28px; padding-bottom: 10px;">
                <span style="display: inline-block; width: 22px; height: 22px; background-color: #2563eb; color: #ffffff; font-size: 11px; font-weight: 800; line-height: 22px; text-align: center; border-radius: 50%;">
                  ${num}
                </span>
              </td>
              <td valign="top" style="padding-bottom: 10px; padding-left: 6px; font-size: 14px; line-height: 1.5; color: #334155; font-weight: 500;">
                ${text}
              </td>
            </tr>
          `;
        } else {
          stepsHtml += `
            <tr>
              <td colspan="2" style="padding-bottom: 6px; font-size: 13px; color: #64748b;">${line}</td>
            </tr>
          `;
        }
      });

      stepsHtml += `</table></div>`;
      formattedContentHtml += stepsHtml;
    }
    // Check if paragraph is assigned role statement
    else if (/assigned\s+(the\s+following\s+)?role/i.test(trimmed)) {
      const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
      const roleName = lines.length > 1 ? lines[lines.length - 1] : trimmed.replace(/.*role:\s*/i, "");
      
      formattedContentHtml += `
        <div style="margin: 18px 0; background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%); border: 1px solid #bae6fd; border-radius: 14px; padding: 16px 20px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="font-size: 12px; font-weight: 700; color: #0369a1; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 4px;">
                Assigned Custom Role
              </td>
            </tr>
            <tr>
              <td style="font-size: 18px; font-weight: 800; color: #0f172a;">
                ${roleName}
              </td>
            </tr>
          </table>
        </div>
      `;
    }
    // Check if paragraph is a closing note or disclaimer
    else if (/if\s+you\s+were\s+not\s+expecting/i.test(trimmed) || /security|administrator/i.test(trimmed)) {
      formattedContentHtml += `
        <div style="margin: 16px 0; background-color: #f1f5f9; border-left: 4px solid #94a3b8; border-radius: 6px; padding: 12px 16px; font-size: 13px; line-height: 1.5; color: #64748b;">
          ${trimmed.replace(/\n/g, "<br>")}
        </div>
      `;
    }
    // Check if paragraph is sign-off
    else if (/^regards/i.test(trimmed)) {
      formattedContentHtml += `
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 14px; line-height: 1.6; color: #475569;">
          ${trimmed.replace(/\n/g, "<br>")}
        </div>
      `;
    }
    // Normal paragraph
    else {
      formattedContentHtml += `
        <p style="margin: 0 0 14px 0; font-size: 15px; line-height: 1.6; color: #334155;">
          ${trimmed.replace(/\n/g, "<br>")}
        </p>
      `;
    }
  }

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${params.subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    @media screen and (max-width: 600px) {
      .container-table { width: 100% !important; padding: 12px !important; }
      .content-padding { padding: 24px 20px !important; }
      .header-padding { padding: 28px 20px !important; }
      .cta-btn { display: block !important; width: 100% !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; color: #0f172a;">
  <!-- Main Wrapper Table -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table class="container-table" role="presentation" border="0" cellpadding="0" cellspacing="0" width="580" style="max-width: 580px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);">
          
          <!-- Header Banner -->
          <tr>
            <td class="header-padding" style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%); padding: 36px 32px; text-align: center;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 12px; padding: 6px 14px; margin-bottom: 12px;">
                      <span style="font-size: 13px; font-weight: 800; color: #ffffff; letter-spacing: 1px; text-transform: uppercase;">
                        🎓 EDUCONNECTS
                      </span>
                    </div>
                    <h2 style="margin: 0; font-size: 14px; font-weight: 600; color: #93c5fd; letter-spacing: 0.5px; text-transform: uppercase;">
                      Staff Administration Portal
                    </h2>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td class="content-padding" style="padding: 36px 36px 28px 36px;">
              
              <!-- Status Badge -->
              <div style="margin-bottom: 16px;">
                <span style="display: inline-block; padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; background-color: ${badgeStyle.bg}; color: ${badgeStyle.text}; border: 1px solid ${badgeStyle.border};">
                  <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: ${badgeStyle.dot}; margin-right: 6px; vertical-align: middle;"></span>
                  ${params.statusBadgeText}
                </span>
              </div>

              <!-- Main Headline -->
              <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.3; letter-spacing: -0.4px;">
                ${params.headline}
              </h1>

              <!-- Greeting -->
              <p style="margin: 0 0 14px 0; font-size: 16px; font-weight: 700; color: #1e293b;">
                Hello ${recipient},
              </p>

              <!-- Formatted Content -->
              <div style="font-size: 15px; line-height: 1.6; color: #334155;">
                ${formattedContentHtml}
              </div>

              <!-- Optional Reason / Note Box -->
              ${params.reasonText ? `
                <div style="margin: 20px 0; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 14px 18px; font-size: 14px; color: #991b1b;">
                  <strong>Note:</strong> ${params.reasonText}
                </div>
              ` : ''}

              <!-- Primary Action Button -->
              ${params.actionUrl ? `
                <div style="margin: 28px 0 12px 0; text-align: center;">
                  <!--[if mso]>
                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${params.actionUrl}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="25%" strokecolor="#2563eb" fillcolor="#2563eb">
                    <w:anchorlock/>
                    <center style="color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:bold;">${params.actionText || 'Go to Staff Registration'}</center>
                  </v:roundrect>
                  <![endif]-->
                  <!--[if !mso]><!-->
                  <a href="${params.actionUrl}" class="cta-btn" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff !important; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35); text-align: center;">
                    ${params.actionText || 'Go to Staff Registration'} &rarr;
                  </a>
                  <!--<![endif]-->
                </div>
              ` : ''}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #64748b;">
                &copy; ${currentYear} EduConnects Platform Inc. All rights reserved.
              </p>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8;">
                Empowering Quality Education Worldwide.
              </p>
              <p style="margin: 0; font-size: 11px; color: #cbd5e1; line-height: 1.4;">
                This is a secure automated invitation sent by the EduConnects administration team.<br>
                Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
