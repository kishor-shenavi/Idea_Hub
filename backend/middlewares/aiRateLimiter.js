const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redis = require('../config/redis');

const aiRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 AI calls per user per minute — generous enough for normal use, tight enough to stop abuse/runaway costs
  keyGenerator: (req) => req.user?.id || req.ip, // per-user when logged in (all these routes require auth anyway), falls back to IP
  message: { success: false, error: 'Too many AI requests. Please wait a moment and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = aiRateLimiter;