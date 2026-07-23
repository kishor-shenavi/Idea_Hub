class AppError extends Error {
  constructor(message, statusCode, type = 'GENERIC') {
    super(message);
    this.statusCode = statusCode;
    this.type = type; // VALIDATION | AUTH | NOT_FOUND | EXTERNAL_SERVICE | GENERIC
    this.isOperational = true; // distinguishes expected errors from real bugs
    Error.captureStackTrace(this, this.constructor);
  }

  static validation(message) { return new AppError(message, 400, 'VALIDATION'); }
  static unauthorized(message = 'Not authorized') { return new AppError(message, 401, 'AUTH'); }
  static forbidden(message = 'Not authorized') { return new AppError(message, 403, 'AUTH'); }
  static notFound(message = 'Resource not found') { return new AppError(message, 404, 'NOT_FOUND'); }
  static externalService(message) { return new AppError(message, 502, 'EXTERNAL_SERVICE'); }
}

module.exports = AppError;