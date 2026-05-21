const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendEmail, otpEmailHtml } = require('../utils/email');

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

const expiresAt = () => {
  const mins = parseInt(process.env.OTP_EXPIRES_MIN) || 10;
  return new Date(Date.now() + mins * 60 * 1000);
};

// POST /api/auth/send-otp  { email, purpose: 'verification'|'password-reset' }
exports.sendOtp = async (req, res) => {
  try {
    const { email, purpose = 'verification' } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    if (purpose === 'password-reset') {
      const userExists = await User.findOne({ email });
      if (!userExists) return res.status(404).json({ message: 'No account found with that email' });
    }

    // Delete any existing OTPs for this email + purpose
    await Otp.deleteMany({ email, purpose });

    const otp = generateOtp();
    const salt = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedOtp = await bcrypt.hash(otp, salt);

    await Otp.create({ email, otp: hashedOtp, purpose, expiresAt: expiresAt() });

    await sendEmail({
      to: email,
      subject: purpose === 'password-reset' ? 'Reset your password — Alumni Bridge' : 'Verify your email — Alumni Bridge',
      html: otpEmailHtml(otp, purpose === 'password-reset' ? 'password reset' : 'email verification'),
    });

    res.json({ message: `OTP sent to ${email}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/verify-otp  { email, otp, purpose }
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, purpose = 'verification' } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const record = await Otp.findOne({ email, purpose, used: false });
    if (!record) return res.status(400).json({ message: 'OTP not found or already used' });
    if (record.expiresAt < new Date()) return res.status(400).json({ message: 'OTP has expired' });

    const valid = await bcrypt.compare(otp, record.otp);
    if (!valid) return res.status(400).json({ message: 'Invalid OTP' });

    record.used = true;
    await record.save();

    if (purpose === 'verification') {
      await User.findOneAndUpdate({ email }, { isEmailVerified: true });
    }

    res.json({ message: 'OTP verified successfully', verified: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/forgot-password  { email }
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with that email' });

    await Otp.deleteMany({ email, purpose: 'password-reset' });

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
    await Otp.create({ email, otp: hashedOtp, purpose: 'password-reset', expiresAt: expiresAt() });

    await sendEmail({
      to: email,
      subject: 'Reset your password — Alumni Bridge',
      html: otpEmailHtml(otp, 'password reset'),
    });

    res.json({ message: `Password reset OTP sent to ${email}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/reset-password  { email, otp, newPassword }
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const record = await Otp.findOne({ email, purpose: 'password-reset', used: false });
    if (!record) return res.status(400).json({ message: 'OTP not found or already used' });
    if (record.expiresAt < new Date()) return res.status(400).json({ message: 'OTP has expired' });

    const valid = await bcrypt.compare(otp, record.otp);
    if (!valid) return res.status(400).json({ message: 'Invalid OTP' });

    record.used = true;
    await record.save();

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
