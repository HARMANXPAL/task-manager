const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Helpers ───────────────────────────────────────────────────────────────────

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

const cookieOptions = () => ({
  httpOnly: true,                                         // inaccessible to JS
  secure: process.env.NODE_ENV === 'production',          // HTTPS only in prod
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000                        // 7 days in ms
});

const sendToken = (res, token) => res.cookie('token', token, cookieOptions());

// ── Controllers ───────────────────────────────────────────────────────────────

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Manual validation so we return clear messages
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const user = await User.create({ name: name.trim(), email, password });
    const token = createToken(user._id);
    sendToken(res, token);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // select('+password') re-includes the field we excluded in the schema
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = createToken(user._id);
    sendToken(res, token);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    user: { id: req.user._id, name: req.user.name, email: req.user.email }
  });
};

module.exports = { register, login, logout, getMe };
