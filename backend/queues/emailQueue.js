const { Queue } = require('bullmq');
const queueConnection = require('../config/queueConnection');
const emailQueue = new Queue('email-queue', { connection: queueConnection });
module.exports = emailQueue;