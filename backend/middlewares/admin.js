// middlewares/admin.js
const { ErrorResponse } = require('../utils/errorHandler');

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return next(new ErrorResponse('Only admin users can access this route', 403));
};
