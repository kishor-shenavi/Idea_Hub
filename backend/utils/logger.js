const winston = require('winston');
const config = require('../config');

const logger = winston.createLogger({
  level: config.isProd ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    config.isProd ? winston.format.json() : winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} [${level}]${requestId ? ` [${requestId}]` : ''}: ${message}${metaStr}`;
      })
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

module.exports = logger;