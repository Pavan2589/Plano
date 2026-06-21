const Redis = require('ioredis');
const env = require('./env');

const redisConfig = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null // Required by BullMQ
};

const redisConnection = new Redis(redisConfig);

redisConnection.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redisConnection.on('connect', () => {
  console.log('Connected to Redis server successfully');
});

module.exports = {
  redisConnection,
  redisConfig
};
