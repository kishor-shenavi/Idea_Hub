const { Queue } = require('bullmq');
const queueConnection = require('../config/queueConnection');

const aiQueue = new Queue('ai-queue', { connection: queueConnection });

module.exports = aiQueue;