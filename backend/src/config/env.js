require('dotenv').config();

const env = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT || 'localhost',
  MINIO_PORT: parseInt(process.env.MINIO_PORT || '9000', 10),
  MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY || 'minioadmin',
  CV_SERVICE_URL: process.env.CV_SERVICE_URL || 'http://localhost:8000',
  NODE_ENV: process.env.NODE_ENV || 'development'
};

// Simple validation to ensure critical secrets are defined in production
if (env.NODE_ENV === 'production') {
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL env variable is required in production');
  if (!env.JWT_ACCESS_SECRET) throw new Error('JWT_ACCESS_SECRET env variable is required in production');
  if (!env.JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET env variable is required in production');
}

module.exports = env;
