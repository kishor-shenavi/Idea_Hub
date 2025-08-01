const express = require('express');
const passport=require('passport');
const jwt =require('jsonwebtoken'); 
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateMe,
  sendOtp, verifyOtp
} = require('../controllers/authController');


const { protect } = require('../middlewares/auth');
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const token = jwt.sign(
    { id: req.user._id, email: req.user.email, role: req.user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
console.log('Token generated google callback:', token);
  // Redirect to frontend with token in query
  res.redirect(`http://localhost:3000/google/success?token=${token}`);
});
// Google token login (for @react-oauth/google)
router.post('/google', async (req, res) => {
  const { token } = req.body;

  console.log('Token received:', token);

  try {
    const decoded = jwt.decode(token); // or use 'google-auth-library' for verification
    console.log("decoded user",decoded);
    const { email, name, picture } = decoded;

    // Check if user exists or create one
    let user = await require('../models/User').findOne({ email });

    if (!user) {
      user = await require('../models/User').create({
        name,
        email,
        password: '123456', // placeholder or use random string
        role: 'student',     // default role
        profilePic: picture, // optional if you use it
      });
    }
const isFirstTime = !user.name || user.isNew;
    const appToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ token: appToken,
      name:user.name, 
       isNewUser: isFirstTime
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(400).json({ error: 'Google login failed' });
  }
});
// PATCH /api/v1/users/updateMe
router.patch('/updateMe', protect, updateMe);
router.post("/sendotp", sendOtp);
router.post("/verifyotp", verifyOtp);

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
                        
module.exports = router;                           