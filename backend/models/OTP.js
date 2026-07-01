const mongoose = require('mongoose');
const mailSender = require('../utils/mailsender');
const emailTemplate = require('../mail/templates/emailVerificationTemplate');

const OTPSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 5 * 60 },
});

OTPSchema.pre('save', async function (next) {
  try {
    await mailSender(this.email, 'Email Verification - IdeaHub', emailTemplate(this.otp));
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('OTP', OTPSchema);
