const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/prisma');
const emailService = require('./email.service');

// Send OTP for signup or forgot password
exports.sendOTP = async (req, res) => {
  try {
    const { email, purpose } = req.body;
    if (!email || !purpose) return res.status(400).json({ error: 'Email and purpose required' });
    
    // For signup: check if email already registered
    if (purpose === 'signup') {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(400).json({ error: 'Email already registered' });
    }
    
    // For forgot: check if email exists
    if (purpose === 'forgot') {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(400).json({ error: 'No account with this email' });
    }

    const result = await emailService.sendOTP(email, purpose);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, code, purpose } = req.body;
    await emailService.verifyOTP(email, code, purpose);
    res.json({ success: true, message: 'OTP verified' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Signup (after OTP verified)
exports.signup = async (req, res) => {
  try {
    const { fullName, email, password, role, college, company } = req.body;
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const avatarInitials = fullName.split(' ').map(n => n[0]).join('').toUpperCase();

    const user = await prisma.user.create({
      data: {
        fullName, email, password: hashed, role,
        college: role === 'STUDENT' || role === 'COLLEGE' ? college : null,
        company: role === 'EMPLOYER' ? company : null,
        isVerified: true, avatarInitials,
      },
    });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, avatarInitials: user.avatarInitials },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, avatarInitials: user.avatarInitials, college: user.college, company: user.company },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reset password (after OTP verified)
exports.resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { email }, data: { password: hashed } });
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};