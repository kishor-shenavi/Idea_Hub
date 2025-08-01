const jwt = require('jsonwebtoken');
const {ErrorResponse} = require('../utils/errorHandler');
const asyncHandler = require('./async');
const user = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
//console.log("Authorization Header: ", req.headers.authorization);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }
  // Set token from cookie
  else if (req.cookies.token) {
    token = req.cookies.token;
  }
  //console.log('Extracted Token:', token); // Add this before the `if (!token)` check
  // Make sure token exists
  if (!token) {
   // console.log("Authorization Header: ", req.headers.authorization);

    return next(new ErrorResponse('Not authorized to access this route', 401));

  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
 // console.log('Decoded Token:', decoded);
  //console.log("id",decoded.id);
    req.user = await user.findById(decoded.id);
    next();
  } catch (err) {
      console.error("JWT Error:", err.message);
   
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});


exports.verifyToken = async (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
};
// Enhanced verifyToken for Socket.io
exports.verifySocketToken = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user to socket
    socket.user = {
      id: decoded.id,
      role: decoded.role
    };
    
    next();
  } catch (err) {
    next(new Error('Authentication failed'));
  }
};

// Grant access to specific roles
// middlewares/auth.js
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Fix typo: req.User → req.user
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`User role ${req.user.role} is not authorized`, 403)
      );
    }
    next();
  };
};