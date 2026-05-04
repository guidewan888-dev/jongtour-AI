import nodemailer from 'nodemailer';

// Create a transporter getter to ensure process.env is evaluated at runtime
const getTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'guidewan888@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'kwbldphbrcxwdfot',
  },
});

const getDefaultFrom = () => `"${process.env.SMTP_FROM_NAME || 'Jongtour Admin'}" <${process.env.SMTP_FROM_EMAIL || 'noreply@jongtour.com'}>`;

// Base HTML Template Shell
const getBaseTemplate = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .header { background-color: #dc2626; padding: 30px 40px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px; }
    .content { padding: 40px; color: #374151; line-height: 1.6; }
    .content h2 { color: #111827; font-size: 20px; margin-top: 0; }
    .button-container { text-align: center; margin: 35px 0; }
    .button { background-color: #dc2626; color: #ffffff !important; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; }
    .footer { background-color: #f9fafb; padding: 20px 40px; text-align: center; color: #6b7280; font-size: 13px; border-top: 1px solid #f3f4f6; }
    .footer p { margin: 5px 0; }
    .warning { font-size: 13px; color: #dc2626; font-weight: bold; margin-top: 20px; }
    .credential-box { background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; font-family: monospace; font-size: 16px; text-align: center; letter-spacing: 1px; color: #111827; border: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>JONGTOUR ELITE</h1>
    </div>
    <div class="content">
      <h2>${title}</h2>
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Jongtour Co., Ltd. All rights reserved.</p>
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
`;

export class EmailService {
  /**
   * Verify SMTP connection
   */
  static async verifyConnection() {
    if (!process.env.SMTP_HOST) {
      console.warn('SMTP_HOST is not defined. Email sending will be skipped.');
      return false;
    }
    try {
      await getTransporter().verify();
      console.log('SMTP connection verified successfully.');
      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return false;
    }
  }

  /**
   * Send Admin Invitation Email
   */
  static async sendAdminInvite(to: string, tempPassword: string, loginUrl: string) {
    const title = 'Welcome to Jongtour Admin Portal';
    const content = `
      <p>Hello,</p>
      <p>You have been invited to join the <strong>Jongtour Elite Admin Portal</strong> with administrative privileges.</p>
      <p>Your temporary login credentials are as follows:</p>
      <div class="credential-box">
        <strong>Email:</strong> ${to}<br>
        <strong>Password:</strong> ${tempPassword}
      </div>
      <p>Please log in using the button below. You will be required to change your password immediately upon your first login.</p>
      <div class="button-container">
        <a href="${loginUrl}" class="button">Log In to Admin Portal</a>
      </div>
      <p class="warning">Security Notice: Do not share these credentials. This temporary password is valid for initial login only.</p>
    `;

    const html = getBaseTemplate(title, content);

    try {
      const info = await getTransporter().sendMail({
        from: getDefaultFrom(),
        to,
        subject: 'Action Required: Jongtour Admin Invitation',
        html,
      });
      console.log(`Invite email sent successfully to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error(`Failed to send invite email to ${to}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send Forgot Password / Reset Link Email
   */
  static async sendPasswordReset(to: string, resetLink: string) {
    const title = 'Password Reset Request';
    const content = `
      <p>Hello,</p>
      <p>We received a request to reset your password for the Jongtour Admin Portal.</p>
      <p>Click the button below to securely set a new password. This link will expire in <strong>1 hour</strong>.</p>
      <div class="button-container">
        <a href="${resetLink}" class="button">Reset Password</a>
      </div>
      <p>If you did not request a password reset, you can safely ignore this email. Your account remains secure.</p>
    `;

    const html = getBaseTemplate(title, content);

    try {
      const info = await getTransporter().sendMail({
        from: getDefaultFrom(),
        to,
        subject: 'Reset your Jongtour Admin password',
        html,
      });
      console.log(`Reset email sent successfully to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error(`Failed to send reset email to ${to}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send Password Changed Notification
   */
  static async sendPasswordChangedNotification(to: string) {
    const title = 'Security Alert: Password Changed';
    const content = `
      <p>Hello,</p>
      <p>This is a confirmation that the password for your Jongtour Admin account was successfully changed.</p>
      <p>If you made this change, no further action is required.</p>
      <p class="warning">If you did NOT make this change, please contact your System Administrator immediately as your account may be compromised.</p>
    `;

    const html = getBaseTemplate(title, content);

    try {
      const info = await getTransporter().sendMail({
        from: getDefaultFrom(),
        to,
        subject: 'Security Alert: Your Jongtour password was changed',
        html,
      });
      console.log(`Notification email sent successfully to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error(`Failed to send notification email to ${to}:`, error);
      return { success: false, error: error.message };
    }
  }
}
