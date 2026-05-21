const jwt = require('jsonwebtoken');
const User = require('../models/User');
const College = require('../models/College');

const signToken = (id, entityType = 'user') =>
  jwt.sign({ id, entityType }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const cookieOptions = () => ({
  expires: new Date(Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRE) || 7) * 24 * 60 * 60 * 1000),
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
});

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, collegeId, graduationYear } = req.body;
    if (!['student', 'alumni'].includes(role)) {
      return res.status(400).json({ message: 'Role must be student or alumni' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name,
      email,
      password,
      role,
      collegeId: collegeId || null,
      graduationYear: role === 'alumni' ? graduationYear : undefined,
      isApproved: false,
    });

    if (collegeId) {
      const College = require('../models/College');
      await College.findByIdAndUpdate(collegeId, {
        $addToSet: { pendingUsers: user._id },
      });
    }

    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved, collegeId: user.collegeId },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.registerCollege = async (req, res) => {
  try {
    const { name, email, password, domain } = req.body;
    const existing = await College.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const college = await College.create({ name, email, password, domain });
    const token = signToken(college._id, 'college');

    res.status(201).json({
      token,
      college: { _id: college._id, name: college.name, email: college.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Try user first
    const user = await User.findOne({ email }).select('+password');
    if (user) {
      if (!(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = signToken(user._id);
      res.cookie('token', token, cookieOptions());
      return res.json({
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved, collegeId: user.collegeId },
        entityType: 'user',
      });
    }

    // Fall back to college
    const college = await College.findOne({ email }).select('+password');
    if (college) {
      if (!(await college.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = signToken(college._id, 'college');
      res.cookie('token', token, cookieOptions());
      return res.json({
        token,
        college: { _id: college._id, name: college.name, email: college.email },
        entityType: 'college',
      });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  if (req.entityType === 'college') {
    return res.json({ college: req.college, entityType: 'college' });
  }
  res.json({ user: req.user, entityType: 'user' });
};
