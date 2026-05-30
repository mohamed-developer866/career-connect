const nodemailer = require('nodemailer');
const crypto = require('crypto');
const prisma = require('../../config/prisma');

// For production: use real Gmail. For dev: OTP shows in console.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password',
  },
});

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendOTP(email, purpose) {
  const code = generateOTP();

  // Delete old OTPs for this email
  await prisma.oTP.deleteMany({ where: { email } });

  // Save new OTP
  await prisma.oTP.create({
    data: {
      email,
      code,
      purpose,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
    },
  });

  // Try sending email, but don't fail if email config missing
  try {
    await transporter.sendMail({
      from: '"Career Connect" <noreply@careerconnect.com>',
      to: email,
      subject: `Your OTP for ${purpose === 'signup' ? 'Sign Up' : 'Password Reset'}`,
      html: `
        <div style="font-family:Arial;max-width:400px;margin:auto;padding:30px;border-radius:16px;background:#f8f7ff;text-align:center">
          <h1 style="color:#6c47ff;">Career Connect</h1>
          <p style="font-size:16px;color:#1a1f3c;">Your verification code is:</p>
          <h2 style="font-size:36px;letter-spacing:6px;color:#6c47ff;background:white;padding:15px;border-radius:12px;">${code}</h2>
          <p style="font-size:12px;color:#6b7280;">Valid for 5 minutes</p>
        </div>
      `,
    });
    console.log(`📧 OTP sent to ${email}: ${code}`);
  } catch (e) {
    // If email fails (dev mode), still log the OTP
    console.log(`📱 OTP for ${email}: ${code} (email sending skipped)`);
  }

  return { success: true, message: 'OTP sent' };
}

async function verifyOTP(email, code, purpose) {
  const otpRecord = await prisma.oTP.findFirst({
    where: {
      email,
      code,
      purpose,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otpRecord) throw new Error('Invalid or expired OTP');

  // Mark as used
  await prisma.oTP.update({ where: { id: otpRecord.id }, data: { used: true } });
  return { success: true };
}

module.exports = { sendOTP, verifyOTP };