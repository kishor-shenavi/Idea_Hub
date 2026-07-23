const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const userRepository = require('../repositories/user.repository');

// ... your existing GoogleStrategy block should still be here, unchanged ...

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: '/api/v1/auth/github/callback',
  scope: ['read:user', 'repo'],
  passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(req.query.state, process.env.JWT_SECRET);

    const user = await userRepository.updateGithubLink(decoded.id, {
      githubId: profile.id,
      githubUsername: profile.username,
      githubAccessToken: accessToken,
    });

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));