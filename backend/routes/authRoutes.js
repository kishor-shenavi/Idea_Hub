const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  sendOtp, verifyOtp, register, login, googleLogin,
  getMe, updateMe, changePassword,logout
} = require('../controllers/authController');

// backend/routes/authRoutes.js — add
const validate = require('../middlewares/validate');
const { loginSchema, registerSchema, sendOtpSchema, verifyOtpSchema, googleLoginSchema, changePasswordSchema } = require('../validators/auth.schema');
router.post('/sendotp', validate(sendOtpSchema), sendOtp);
router.post('/verifyotp', validate(verifyOtpSchema), verifyOtp);
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/google', validate(googleLoginSchema), googleLogin);
router.post('/logout', protect, logout);
// Passport Google OAuth (redirect flow)
router.get('/google/oauth', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.redirect(`${process.env.CLIENT_URL}/auth/google/success?token=${token}`);
  }
);

 // GitHub account linking — token passed via query since this is a full page redirect, not an axios call
router.get('/github/oauth', (req, res, next) => {
  const token = req.query.token;
  if (!token) {
    return res.status(401).json({ success: false, error: 'Missing auth token' });
  }
  passport.authenticate('github', { scope: ['read:user', 'repo'], state: token })(req, res, next);
});

router.get('/github/callback', (req, res, next) => {
  passport.authenticate('github', { session: false }, (err, user) => {
    if (err) {
      const isDuplicateLink = err.message?.includes('already exists');
      const reason = isDuplicateLink ? 'already_linked' : 'connection_failed';
      return res.redirect(`${process.env.CLIENT_URL}/github-intelligence?error=${reason}`);
    }
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/github-intelligence?error=connection_failed`);
    }
    res.redirect(`${process.env.CLIENT_URL}/github-intelligence`);
  })(req, res, next);
});

router.get('/me', protect, getMe);
router.patch('/updateme', protect, updateMe);
router.patch('/changepassword', protect, validate(changePasswordSchema), changePassword);

module.exports = router;
