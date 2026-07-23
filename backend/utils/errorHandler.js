const AppError = require('./AppError');
const logger = require('./logger');
const config = require('../config');

// ErrorResponse kept as an alias so every existing `require('../utils/errorHandler').ErrorResponse`
// across your controllers keeps working without touching those files today.
const ErrorResponse = AppError;

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (err.name === 'CastError') error = AppError.notFound('Resource not found');
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error = AppError.validation(`${field} already exists`);
  }
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(e => e.message).join(', ');
    error = AppError.validation(message);
  }

  const statusCode = error.statusCode || 500;

  logger.error(error.message, {
    requestId: req.id,
    statusCode,
    path: req.originalUrl,
    method: req.method,
    stack: config.isProd ? undefined : error.stack, // never log/send stack traces in prod
  });

  res.status(statusCode).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

module.exports = { ErrorResponse, AppError, errorHandler };