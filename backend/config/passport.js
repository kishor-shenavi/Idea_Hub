// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const User = require('../models/User');

// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: '/api/v1/auth/google/callback',
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     let user = await User.findOne({ googleId: profile.id });
//     if (!user) {
//       user = await User.create({
//         googleId: profile.id,
//         email: profile.emails[0].value,
//         name: profile.displayName,
//         role: 'student',
//         isVerified: true,
//       });
//     }
//     return done(null, user);
//   } catch (err) {
//     return done(err, null);
//   }
// }));
const passport = require("passport");

const GitHubStrategy = require('passport-github2').Strategy;

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: '/api/v1/auth/github/callback',
  scope: ['read:user', 'repo'], // repo scope needed to read private repos + register webhooks
  passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    // req.query.state carries the JWT of the already-logged-in user — see authRoutes.js
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(req.query.state, process.env.JWT_SECRET);
    const User = require('../models/User');

    const user = await User.findByIdAndUpdate(decoded.id, {
      githubId: profile.id,
      githubUsername: profile.username,
      githubAccessToken: accessToken,
    }, { new: true });

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));