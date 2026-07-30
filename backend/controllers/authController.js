// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const otpRepository = require('../repositories/otp.repository');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/async');
const sendTokenResponse = require('../utils/responseHandler');
const redis = require('../config/redis');
//const mailSender = require('../utils/mailsender');
//const emailTemplate = require('../mail/templates/emailVerificationTemplate');
const emailQueue=require("../queues/emailQueue");


exports.sendOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const existing = await userRepository.findByEmail(email);
  if (existing) return next(AppError.validation('Email already registered'));

  const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

  await redis.set(`otp:${email}`, generatedOtp, 'EX', 300); // store first now — email is no longer the gate

  await emailQueue.add('send-otp-email', { email, otp: generatedOtp }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  });

  res.status(200).json({ success: true, message: 'OTP sent to your email' });
});

exports.verifyOtp = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  const stored = await redis.get(`otp:${email}`);
  if (!stored || stored !== otp) return next(AppError.validation('Invalid or expired OTP'));
  await redis.del(`otp:${email}`);
  res.status(200).json({ success: true, message: 'OTP verified' });
});
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userRepository.findByEmail(email, true);
  if (!user || !user.password) return next(AppError.unauthorized('Invalid credentials'));
  const isMatch = await user.matchPassword(password);
  if (!isMatch) return next(AppError.unauthorized('Invalid credentials'));
  sendTokenResponse(user, 200, res);
});

exports.googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const decoded = jwt.decode(token);
  const { email, name, picture } = decoded;
  let user = await userRepository.findByEmail(email);
  if (!user) {
    user = await userRepository.create({ name, email, password: Math.random().toString(36), role: 'student', avatar: picture, isVerified: true });
  }
  sendTokenResponse(user, 200, res);
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await userRepository.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const allowed = ['name', 'year', 'branch', 'bio', 'linkedinUrl', 'githubUrl', 'interests', 'goalType', 'avatar'];
  const updates = {};
  allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });
  const user = await userRepository.updateById(req.user.id, updates);
  res.status(200).json({ success: true, data: user });
});

exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await userRepository.findById(req.user.id, { withPassword: true }); // note: your findById signature currently only supports `withGithubToken` — see below
  if (!user.password) return next(AppError.validation('Password change not available for Google accounts'));
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) return next(AppError.unauthorized('Current password is incorrect'));
  user.password = newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, year, branch } = req.body;
  const user = await userRepository.create({ name, email, password, year, branch, role: 'student', isVerified: true });
  sendTokenResponse(user, 201, res);
});


exports.logout = asyncHandler(async (req, res) => {
  const decoded = jwt.decode(req.token); // just reads the payload, doesn't re-verify — protect() already did that
  const remainingSeconds = decoded.exp - Math.floor(Date.now() / 1000);

  if (remainingSeconds > 0) {
    await redis.set(`blacklist:${req.token}`, '1', 'EX', remainingSeconds);
  }

  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

exports.updatePublicKey = asyncHandler(async (req, res) => {
  await userRepository.updateById(req.user.id, { publicKeyJwk: req.body.publicKey });
  res.status(200).json({ success: true });
});

exports.getPublicKey = asyncHandler(async (req, res, next) => {
  const user = await userRepository.findPublicKey(req.params.userId);
  if (!user) return next(AppError.notFound('User not found'));
  if (!user.publicKeyJwk) return next(AppError.validation('This user has not set up encrypted chat yet'));
  res.status(200).json({ success: true, data: { publicKey: user.publicKeyJwk, name: user.name } });
});