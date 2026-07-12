const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  sendOtp, verifyOtp, register, login, googleLogin,
  getMe, updateMe, changePassword,
} = require('../controllers/authController');

router.post('/sendotp', sendOtp);
router.post('/verifyotp', verifyOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);

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

router.get('/github/callback',
  passport.authenticate('github', { session: false }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/github-intelligence`);
  }
);

router.get('/me', protect, getMe);
router.patch('/updateme', protect, updateMe);
router.patch('/changepassword', protect, changePassword);

module.exports = router;
