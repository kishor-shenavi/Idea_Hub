const { Queue } = require('bullmq');
const queueConnection = require('../config/queueConnection');
const cronQueue = new Queue('cron-queue', { connection: queueConnection });
module.exports = cronQueue;