const IORedis = require('ioredis');
const config = require('./index');
const logger = require('./../utils/logger');

const queueConnection = new IORedis(config.redis.url, {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => Math.min(times * 200, 5000),
});
queueConnection.on('error', (err) => logger.error('Queue Redis connection error', { error: err.message }));
module.exports = queueConnection;