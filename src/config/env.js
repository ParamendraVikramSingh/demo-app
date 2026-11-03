require('dotenv').config();

const required = ['MONGO_URI', 'JWT_SECRET', 'REDIS_URL'];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  REDIS_URL: process.env.REDIS_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_TO_FILE: process.env.LOG_TO_FILE === 'true',
  SLOW_THRESHOLD_MS: parseInt(process.env.SLOW_THRESHOLD_MS || '1000', 10),
  SERVICE_NAME: 'chatcommerce-api',
};
