const redis = require('../config/redis');
const logger = require('../utils/logger');

// Cache-aside: check Redis first, fall back to the provided fetch function on miss, write result back with TTL
async function cacheAside(key, ttlSeconds, fetchFn) {
  try {
    const cached = await redis.get(key);
    if (cached) {
      logger.debug('Cache hit', { key });
      return JSON.parse(cached);
    }
  } catch (err) {
    logger.error('Redis read failed, falling back to source', { key, error: err.message });
  }

  logger.debug('Cache miss', { key });
  const fresh = await fetchFn();

  try {
    await redis.set(key, JSON.stringify(fresh), 'EX', ttlSeconds);
  } catch (err) {
    logger.error('Redis write failed, continuing without cache', { key, error: err.message });
  }

  return fresh;
}

// invalidate one or more keys — used after writes
async function invalidate(keys) {
  const keyArray = Array.isArray(keys) ? keys : [keys];
  try {
    if (keyArray.length) await redis.del(...keyArray);
  } catch (err) {
    logger.error('Redis invalidation failed', { keys: keyArray, error: err.message });
  }
}

// invalidate by pattern (needed for the projects feed, since query params create many different cache keys)
async function invalidatePattern(pattern) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  } catch (err) {
    logger.error('Redis pattern invalidation failed', { pattern, error: err.message });
  }
}

module.exports = { cacheAside, invalidate, invalidatePattern };