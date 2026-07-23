const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const redis = require('../config/redis');
const aiQueue = require('../queues/aiQueue');

// races a check against a timeout — if the check hasn't resolved in time, treat it as down
// rather than let the whole /health request hang waiting for internal retry logic to give up
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

router.get('/health', async (req, res) => {
  const checks = { mongo: 'unknown', redis: 'unknown', queue: 'unknown' };
  let healthy = true;

  checks.mongo = mongoose.connection.readyState === 1 ? 'up' : 'down';
  if (checks.mongo === 'down') healthy = false;

  try {
    await withTimeout(redis.ping(), 1500); // 1.5s hard cap — fast answer, not a real retry attempt
    checks.redis = 'up';
  } catch {
    checks.redis = 'down';
    healthy = false;
  }

  try {
    const counts = await withTimeout(aiQueue.getJobCounts(), 1500);
    checks.queue = 'up';
    checks.queueCounts = counts;
  } catch {
    checks.queue = 'down';
    healthy = false;
  }

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'degraded',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    checks,
  });
});

module.exports = router;