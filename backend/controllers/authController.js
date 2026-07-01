const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { ErrorResponse } = require('../utils/errorHandler');
const asyncHandler = require('../middlewares/async');
const sendTokenResponse = require('../utils/responseHandler');

// POST /api/v1/auth/sendotp
exports.sendOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new ErrorResponse('Email is required', 400));

  const existing = await User.findOne({ email });
  if (existing) return next(new ErrorResponse('Email already registered', 400));

  const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
  await OTP.create({ email, otp: generatedOtp });

  res.status(200).json({ success: true, message: 'OTP sent to your email' });
});

// POST /api/v1/auth/verifyotp
exports.verifyOtp = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) return next(new ErrorResponse('Email and OTP are required', 400));

  const record = await OTP.findOne({ email, otp });
  if (!record) return next(new ErrorResponse('Invalid or expired OTP', 400));

  await OTP.deleteOne({ email });
  res.status(200).json({ success: true, message: 'OTP verified' });
});

// POST /api/v1/auth/register
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, year, branch } = req.body;

  const user = await User.create({ name, email, password, year, branch, role: 'student', isVerified: true });
  sendTokenResponse(user, 201, res);
});

// POST /api/v1/auth/login
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new ErrorResponse('Please provide email and password', 400));

  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password) return next(new ErrorResponse('Invalid credentials', 401));

  const isMatch = await user.matchPassword(password);
  if (!isMatch) return next(new ErrorResponse('Invalid credentials', 401));

  sendTokenResponse(user, 200, res);
});

// POST /api/v1/auth/google  (token from @react-oauth/google)
exports.googleLogin = asyncHandler(async (req, res, next) => {
  const { token } = req.body;
  if (!token) return next(new ErrorResponse('Google token required', 400));

  const decoded = jwt.decode(token);
  const { email, name, picture } = decoded;

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name, email, password: Math.random().toString(36), role: 'student', avatar: picture, isVerified: true });
  }

  sendTokenResponse(user, 200, res);
});

// GET /api/v1/auth/me
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
});

// PATCH /api/v1/auth/updateme
exports.updateMe = asyncHandler(async (req, res, next) => {
  const allowed = ['name', 'year', 'branch', 'bio', 'linkedinUrl', 'githubUrl', 'interests', 'goalType', 'avatar'];
  const updates = {};
  allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: user });
});

// PATCH /api/v1/auth/changepassword
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  if (!user.password) return next(new ErrorResponse('Password change not available for Google accounts', 400));

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) return next(new ErrorResponse('Current password is incorrect', 401));

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});
