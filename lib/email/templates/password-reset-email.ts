export interface PasswordResetEmailParams {
  recipientEmail: string;
  firstName?: string;
  resetUrl: string;
}

/**
 * Generates responsive, branded HTML for EduConnect Password Reset requests.
 */
export function generatePasswordResetEmailHtml(params: PasswordResetEmailParams): string {
  const { firstName, resetUrl } = params;
  const recipientName = firstName && firstName.trim() ? firstName.trim() : "there";
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Reset your EduConnect password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f1f5f9;
      color: #0f172a;
      margin: 0;
      padding: 0;
      width: 100% !important;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f1f5f9;
      padding: 40px 16px;
    }
    .main-card {
      max-width: 540px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
      border: 1px solid #e2e8f0;
    }
    .header-banner {
      background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%);
      padding: 36px 24px;
      text-align: center;
    }
    .brand-title {
      color: #ffffff;
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 1.5px;
      margin: 0;
      text-transform: uppercase;
    }
    .brand-tagline {
      color: #93c5fd;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-top: 4px;
      margin-bottom: 0;
    }
    .badge-icon {
      width: 56px;
      height: 56px;
      background: #ffffff;
      border-radius: 18px;
      line-height: 56px;
      font-size: 28px;
      margin: -28px auto 0 auto;
      text-align: center;
      box-shadow: 0 8px 20px rgba(37, 99, 235, 0.2);
    }
    .content-body {
      padding: 32px 36px;
      text-align: center;
    }
    .greeting {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 12px;
      margin-bottom: 8px;
    }
    .body-text {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin: 0 0 24px 0;
    }
    .cta-container {
      margin: 32px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff !important;
      font-size: 15px;
      font-weight: 700;
      text-decoration: none;
      padding: 14px 36px;
      border-radius: 14px;
      box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
    }
    .expiry-notice {
      background: #f8fafc;
      border-left: 4px solid #64748b;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 13px;
      color: #64748b;
      text-align: left;
      margin: 20px 0;
    }
    .disregard-text {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.5;
      margin-top: 20px;
      margin-bottom: 0;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 36px;
      text-align: center;
      border-top: 1px solid #f1f5f9;
    }
    .footer-brand {
      font-weight: 700;
      font-size: 14px;
      color: #475569;
      margin: 0;
    }
    .footer-tagline {
      font-size: 12px;
      color: #94a3b8;
      margin: 2px 0 12px 0;
    }
    .footer-copyright {
      font-size: 11px;
      color: #cbd5e1;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main-card">
      <div class="header-banner">
        <h1 class="brand-title">EDUCONNECT</h1>
        <p class="brand-tagline">Learn. Connect. Grow.</p>
      </div>

      <div class="badge-icon">🔑</div>

      <div class="content-body">
        <h2 class="greeting">Hello ${recipientName},</h2>
        <p class="body-text">
          We received a request to reset your EduConnect password. Click the button below to choose a new password:
        </p>

        <div class="cta-container">
          <a href="${resetUrl}" class="cta-button" target="_blank">Reset Password</a>
        </div>

        <div class="expiry-notice">
          ⏱️ <strong>Note:</strong> This link will expire soon for your security.
        </div>

        <p class="disregard-text">
          If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>

      <div class="footer">
        <p class="footer-brand">EduConnect</p>
        <p class="footer-tagline">Learn. Connect. Grow.</p>
        <p class="footer-copyright">&copy; ${currentYear} EduConnect. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
