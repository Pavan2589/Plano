const { Queue } = require('bullmq');
const { redisConfig } = require('../config/redis');

const embeddingQueue = new Queue('embedding_generation', {
  connection: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000 // 1 second initial delay
    }
  }
});

module.exports = embeddingQueue;
