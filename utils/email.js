const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    const isGmail = (process.env.SMTP_HOST || '').includes('gmail') ||
                    (process.env.SMTP_USER || '').endsWith('@gmail.com');
    transporter = nodemailer.createTransport(
      isGmail
        ? {
            service: 'gmail',
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          }
        : {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: parseInt(process.env.SMTP_PORT) === 465,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          }
    );
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  const isDev = process.env.NODE_ENV !== 'production';

  // Extract OTP from html for console fallback (matches 6 consecutive digits)
  const otpMatch = html.match(/\b(\d{6})\b/);
  const otp = otpMatch ? otpMatch[1] : null;

  try {
    await getTransporter().sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    if (isDev) console.log(`[Email] Sent "${subject}" to ${to}`);
  } catch (err) {
    transporter = null; // reset so next attempt uses fresh credentials
    if (isDev) {
      console.warn(`[Email] SMTP failed: ${err.message}`);
      if (otp) {
        console.log('─────────────────────────────────────');
        console.log('[OTP DEV FALLBACK]');
        console.log(`  To      : ${to}`);
        console.log(`  Subject : ${subject}`);
        console.log(`  OTP     : ${otp}`);
        console.log('─────────────────────────────────────');
      }
      return;
    }
    throw err;
  }
};

const otpEmailHtml = (otp, purpose = 'verification') => `
  <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:16px;">
    <div style="background:#2563eb;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Alumni Bridge</h1>
    </div>
    <h2 style="color:#111827;font-size:18px;margin:0 0 8px;">Your OTP Code</h2>
    <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
      Use the code below for ${purpose}. It expires in <strong>${process.env.OTP_EXPIRES_MIN || 10} minutes</strong>.
    </p>
    <div style="background:#fff;border:2px dashed #2563eb;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#2563eb;">${otp}</span>
    </div>
    <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
      If you didn't request this, you can safely ignore this email.
    </p>
  </div>
`;

module.exports = { sendEmail, otpEmailHtml };
