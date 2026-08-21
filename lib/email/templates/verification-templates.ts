export interface NotificationEmailParams {
  email: string;
  recipientName: string;
  subject: string;
  headline: string;
  bodyText: string;
  statusBadgeText: string;
  statusBadgeVariant: "pending" | "success" | "danger" | "warning";
  reasonText?: string;
  actionUrl?: string;
  actionText?: string;
}

export function generateNotificationEmailHtml(params: NotificationEmailParams): string {
  const badgeColors = {
    pending: { bg: "#fef3c7", text: "#d97706", border: "#fde68a" },
    success: { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0" },
    danger: { bg: "#fee2e2", text: "#b91c1c", border: "#fca5a5" },
    warning: { bg: "#ffedd5", text: "#c2410c", border: "#fed7aa" },
  };

  const badgeStyle = badgeColors[params.statusBadgeVariant] || badgeColors.pending;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 40px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
    .logo { font-size: 24px; font-weight: 900; color: #2563eb; letter-spacing: -0.5px; margin-bottom: 24px; text-transform: uppercase; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; background-color: ${badgeStyle.bg}; color: ${badgeStyle.text}; border: 1px solid ${badgeStyle.border}; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 800; margin: 0 0 12px 0; color: #0f172a; }
    p { font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 20px 0; }
    .reason-box { background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 16px; border-radius: 8px; font-size: 14px; color: #334155; margin: 20px 0; font-style: italic; }
    .cta-button { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 12px; margin-top: 10px; }
    .footer { margin-top: 36px; pt-24px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">EduConnect</div>
    <div><span class="badge">${params.statusBadgeText}</span></div>
    <h1>${params.headline}</h1>
    <p>Hello ${params.recipientName},</p>
    <p>${params.bodyText}</p>

    ${params.reasonText ? `<div class="reason-box"><strong>Note / Reason:</strong> "${params.reasonText}"</div>` : ''}

    ${params.actionUrl ? `<a href="${params.actionUrl}" class="cta-button">${params.actionText || 'View Account Portal'}</a>` : ''}

    <div class="footer">
      <p>© ${new Date().getFullYear()} EduConnect Platform Inc. All rights reserved.<br>Empowering Quality Education Worldwide.</p>
    </div>
  </div>
</body>
</html>
  `;
}
