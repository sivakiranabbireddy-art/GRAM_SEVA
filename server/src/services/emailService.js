const nodemailer = require('nodemailer');

const hasEmailJsConfig = () => {
  return !!(
    process.env.EMAILJS_SERVICE_ID &&
    (process.env.EMAILJS_TEMPLATE_ID || 'template_0usum6k') &&
    process.env.EMAILJS_PUBLIC_KEY
  );
};

const hasSmtpConfig = () => {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
};

let transporter = null;
if (hasSmtpConfig()) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

/**
 * Send OTP email via EmailJS REST API
 */
async function sendViaEmailJS(email, otp, recipientName, purpose = 'verification') {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID || 'template_0usum6k';
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  const actionText = purpose === 'password_reset' ? 'password reset' : 'account verification';
  const messageText = `Your GramSeva ${actionText} code is ${otp}. This OTP is valid for 10 minutes.`;

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    ...(privateKey ? { accessToken: privateKey } : {}),
    template_params: {
      to_email: email,
      email: email,
      user_email: email,
      recipient_email: email,
      to_name: recipientName,
      name: recipientName,
      otp: otp,
      passcode: otp,
      otp_code: otp,
      purpose: actionText,
      message: messageText
    }
  };

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:5173'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`EmailJS API returned status ${response.status}: ${errorText}`);
  }

  return true;
}

/**
 * Send 6-digit OTP for Registration or Password Reset
 */
async function sendOtpEmail(email, otp, recipientName = 'User', purpose = 'verification') {
  const isReset = purpose === 'password_reset';
  const actionTitle = isReset ? 'Password Reset' : 'Verification';

  console.log('----------------------------------------------------');
  console.log(`[GramSeva OTP Delivery - ${actionTitle}]`);
  console.log(`Recipient: ${email} (${recipientName})`);
  console.log(`Verification Code (OTP): >>> ${otp} <<<`);
  console.log(`Purpose: ${purpose}`);
  console.log(`EmailJS Configured: ${hasEmailJsConfig() ? 'YES' : 'NO'}`);
  console.log(`SMTP Configured: ${hasSmtpConfig() ? 'YES' : 'NO'}`);
  console.log('----------------------------------------------------');

  if (hasEmailJsConfig()) {
    try {
      console.log(`Dispatching ${purpose} OTP via EmailJS...`);
      await sendViaEmailJS(email, otp, recipientName, purpose);
      console.log(`✓ EmailJS OTP dispatched successfully to ${email}`);
      return {
        sent: true,
        devMode: false,
        provider: 'EmailJS',
        message: `Verification code sent to ${email} via EmailJS.`
      };
    } catch (err) {
      console.error('EmailJS delivery failed:', err.message);
      return {
        sent: false,
        devMode: true,
        devOtp: otp,
        error: `EmailJS error: ${err.message}. OTP displayed for testing.`
      };
    }
  }

  if (hasSmtpConfig()) {
    try {
      const fromEmail = process.env.EMAIL_FROM || 'GramSeva <no-reply@gramseva.in>';
      const subject = isReset 
        ? `GramSeva Password Reset Code: ${otp}` 
        : `GramSeva Verification Code: ${otp}`;
      const introText = isReset
        ? 'You recently requested to reset your GramSeva password. Please enter the following 6-digit code to proceed:'
        : 'Thank you for registering on GramSeva. Please use the following 6-digit code to verify your email address:';

      await transporter.sendMail({
        from: fromEmail,
        to: email,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #0d9488; padding: 20px; text-align: center; color: white;">
              <h2 style="margin: 0; font-size: 24px;">GramSeva ${actionTitle}</h2>
              <p style="margin: 5px 0 0; opacity: 0.9;">A Digital Platform for Accessible Local Services</p>
            </div>
            <div style="padding: 24px; color: #334155;">
              <p>Hello <strong>${recipientName}</strong>,</p>
              <p>${introText}</p>
              <div style="text-align: center; margin: 24px 0;">
                <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0d9488; background: #f0fdf4; padding: 12px 24px; border: 1px dashed #0d9488; border-radius: 6px;">${otp}</span>
              </div>
              <p style="font-size: 13px; color: #64748b;">This OTP is valid for 10 minutes. If you did not make this request, please ignore this email or contact GramSeva support.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #94a3b8; text-align: center;">GramSeva CSI Community Service Platform</p>
            </div>
          </div>
        `
      });
      return { sent: true, devMode: false, provider: 'SMTP' };
    } catch (err) {
      console.error('Nodemailer SMTP delivery failed:', err.message);
      return { sent: false, devMode: true, devOtp: otp, error: 'SMTP delivery failed; logged in console.' };
    }
  }

  return {
    sent: false,
    devMode: true,
    devOtp: otp,
    message: 'OTP generated in development mode (displayed in console & UI for easy testing).'
  };
}

module.exports = {
  sendOtpEmail,
  sendViaEmailJS,
  hasEmailJsConfig,
  hasSmtpConfig
};
