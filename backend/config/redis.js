const Redis=require('ioredis');
const config=require('./index');

const logger=require('../utils/logger');
const { error } = require('winston');

const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 200, 5000), // always keeps retrying, delay grows up to 5s max — never gives up permanently
});


redis.on('connect',()=>logger.info('Redis connected'));
redis.on('error',(err)=>logger.error('Redis connectection error',{error:err.message}));

module.exports=redis;

