const logger = require('../utils/logger');

module.exports = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger.log(level, `${req.method} ${req.originalUrl} ${res.statusCode}`, {
      requestId: req.id,
      duration: `${duration}ms`,
      userId: req.user?.id,
    });
    if (duration > 500) {
      logger.warn(`Slow request: ${req.method} ${req.originalUrl} took ${duration}ms`, { requestId: req.id });
    }
  });

  next();
};