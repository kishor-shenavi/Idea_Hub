// models/OTP.js

const mongoose = require("mongoose");
const mailSender = require("../utils/mailsender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 5 * 60, // ⏰ auto-delete in 5 mins
  },
});

// Pre-save middleware to send email
OTPSchema.pre("save", async function (next) {
  try {
    const otpval=this.otp;
    console.log('OTP generated:', otpval);
    await mailSender(
      this.email,
      "Email Verification - OTP",
      emailTemplate(otpval)
    );
    console.log("✅ OTP email sent to", this.email);
    next();
  } catch (error) {
    console.error("❌ Error sending email:", error);
    next(error); // Pass error to Mongoose
  }
});

module.exports = mongoose.model("OTP", OTPSchema);
