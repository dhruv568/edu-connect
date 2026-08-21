export interface EmailTemplateParams {
  recipientEmail: string;
  firstName: string;
  otp: string;
  verificationUrl: string;
  expiresInMinutes: number;
}

/**
 * Generates responsive, branded HTML for EduConnect Email Verification.
 */
export function generateVerificationEmailHtml(params: EmailTemplateParams): string {
  const { firstName, otp, verificationUrl, expiresInMinutes } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your EduConnect email</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: #2563eb;
      padding: 32px;
      text-align: center;
    }
    .brand {
      color: #ffffff;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0;
      text-transform: uppercase;
    }
    .content {
      padding: 36px 32px;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 16px;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .otp-box {
      background: #eff6ff;
      border: 2px dashed #3b82f6;
      border-radius: 14px;
      padding: 20px;
      text-align: center;
      margin: 28px 0;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #1e40af;
      font-family: monospace;
      margin: 0;
    }
    .otp-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin-top: 8px;
      font-weight: 600;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0;
    }
    .btn {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 12px;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25);
    }
    .notice {
      background: #f1f5f9;
      border-left: 4px solid #94a3b8;
      padding: 14px 16px;
      border-radius: 6px;
      font-size: 13px;
      color: #64748b;
      margin-top: 24px;
    }
    .footer {
      padding: 24px 32px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 13px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="brand">🎓 EDUCONNECT</div>
    </div>
    <div class="content">
      <h1>Verify your email address</h1>
      <p>Hi ${firstName},</p>
      <p>Welcome to EduConnect! Please enter the 6-digit verification code below or click the button to confirm your account.</p>

      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div class="otp-label">Your 6-Digit Verification OTP</div>
      </div>

      <div class="btn-container">
        <a href="${verificationUrl}" class="btn" target="_blank">Verify My Account</a>
      </div>

      <div class="notice">
        ⏱️ This code and link will expire in <strong>${expiresInMinutes} minutes</strong>. If you did not request an EduConnect account, please ignore this email.
      </div>
    </div>
    <div class="footer">
      &copy; 2026 EduConnect Platform Inc. Connecting Teachers, Students, and Parents.
    </div>
  </div>
</body>
</html>
  `;
}
