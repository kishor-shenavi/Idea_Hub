// utils/errorHandler.js
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.success = false; 
  }
}

const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Better error logging
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Server Error';

  res.status(statusCode).json({
    success: false,
    error: message
  });
};

module.exports = { ErrorResponse, errorHandler };