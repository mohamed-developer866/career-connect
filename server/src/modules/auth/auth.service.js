const prisma = require('../../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;

async function signup({ fullName, email, password, role, college, company }) {
  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('Email already in use');
  }

  // Hash the password
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  // Generate avatar initials (e.g., "Bhuvaneshwaran G" → "BG")
  const avatarInitials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  // Create user in database
  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashed,
      role,
      college: role === 'STUDENT' || role === 'COLLEGE' ? college : null,
      company: role === 'EMPLOYER' ? company : null,
      avatarInitials,
    },
  });

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Return token + user info (never return password)
  return {
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatarInitials: user.avatarInitials,
      college: user.college,
      company: user.company,
    },
  };
}

async function login({ email, password }) {
  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Compare password with hashed password in DB
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // Generate fresh JWT token
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Return token + user info
  return {
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatarInitials: user.avatarInitials,
      college: user.college,
      company: user.company,
    },
  };
}

module.exports = { signup, login };