const { Queue } = require('bullmq');
const { redisConfig } = require('../config/redis');

const complianceQueue = new Queue('compliance_check', {
  connection: redisConfig,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
});

module.exports = complianceQueue;
