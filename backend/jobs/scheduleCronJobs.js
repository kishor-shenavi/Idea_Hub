const cronQueue = require('../queues/cronQueue');
const logger = require('../utils/logger');

async function scheduleCronJobs() {
  // jobId makes this idempotent — safe to call on every worker restart, BullMQ won't create duplicates
  await cronQueue.add('cleanup-stuck-scans', {}, {
    repeat: { every: 5* 60 * 1000 }, // every 5 minutes
    jobId: 'cleanup-stuck-scans',
  });
  await cronQueue.add('expire-internships', {}, {
    repeat: { every: 60 * 60 * 1000 }, // hourly
    jobId: 'expire-internships',
  });
  logger.info('Cron jobs scheduled: cleanup-stuck-scans (5min), expire-internships (hourly)');
}

module.exports = scheduleCronJobs;