const jwt = require('jsonwebtoken');
const { ErrorResponse } = require('../utils/errorHandler');
const asyncHandler = require('./async');
const User = require('../models/User');

const redis = require('../config/redis'); // add this import

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  // check blacklist before verifying — a logged-out token should be rejected even if it's still cryptographically valid
  const isBlacklisted = await redis.get(`blacklist:${token}`);
  if (isBlacklisted) {
    return next(new ErrorResponse('Session expired, please log in again', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return next(new ErrorResponse('User not found', 401));
    req.token = token; // needed by the logout controller below to know exactly what to blacklist
    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ErrorResponse(`Role '${req.user.role}' is not authorized`, 403));
  }
  next();
};

exports.verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
};