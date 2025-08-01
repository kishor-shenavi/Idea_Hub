const User = require('../models/User');
const ErrorResponse = require('../utils/errorHandler');
const asyncHandler = require('../middlewares/async');
const sendTokenResponse = require('../utils/responseHandler');
const otp=require('../models/OTP');
const sendEmail = require('../utils/mailsender');
const otpGenerator = require('otp-generator');


// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password} = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role:'student'
  });

  sendTokenResponse(user, 200, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }
 // console.log(token);
 sendTokenResponse(user, 200, res);
 
});


exports.updateMe = async (req, res) => {
  const updates = {};
  if (req.body.name) updates.name = req.body.name;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ status: 'success', data: updatedUser });
};


exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
let generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    // let generatedOtp = otpGenerator.generate(4, {
    //   digits: true,
    //   upperCaseAlphabet: false,
    //   lowerCaseAlphabet: false,
    //   specialChars: false,
    // });

    // Ensure OTP is numeric (extra validation in case)
    // if (!/^\d+$/.test(generatedOtp)) {
    //   generatedOtp = otpGenerator.generate(4, {
    //     digits: true,
    //     upperCaseAlphabet: false,
    //     lowerCaseAlphabet: false,
    //     specialChars: false,
    //   });
    //}

    // Ensure unique OTP
    let result = await otp.findOne({ otp: generatedOtp });
    while (result) {
      let generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      // generatedOtp = otpGenerator.generate(4, {
      //   digits: true,
      //   upperCaseAlphabet: false,
      //   lowerCaseAlphabet: false,
      //   specialChars: false,
      // });
      result = await otp.findOne({ otp: generatedOtp });
    }

    const createdOtp = await otp.create({ email, otp: generatedOtp });

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email.",
      createdOtp,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp: enteredOtp } = req.body;

    if (!email || !enteredOtp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const existingOtp = await otp.findOne({ email, otp: enteredOtp });

    if (!existingOtp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // OTP verified — delete it so it's single-use
    await otp.deleteOne({ email });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now register.",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Server error" });
  }
};












// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const currentuser = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: currentuser,
  });
});