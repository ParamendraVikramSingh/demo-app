const Redis = require('ioredis');

let client;
let logger;
const getLogger = () => {
  if (!logger) logger = require('../utils/logger');
  return logger;
};

const connectRedis = () => {
  client = new Redis(process.env.REDIS_URL, {
    lazyConnect: false,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  });

  client.on('connect', () => {
    getLogger().info('Redis connected', { type: 'app', event: 'redis_connected', service: 'redis' });
  });

  client.on('ready', () => {
    getLogger().info('Redis ready', { type: 'app', event: 'redis_ready', service: 'redis' });
  });

  client.on('error', (err) => {
    getLogger().error('Redis error', { type: 'app', event: 'redis_error', service: 'redis', error: err.message });
  });

  client.on('close', () => {
    getLogger().warn('Redis connection closed', { type: 'app', event: 'redis_closed', service: 'redis' });
  });

  return client;
};

const getRedis = () => {
  if (!client) throw new Error('Redis client not initialized. Call connectRedis() first.');
  return client;
};

module.exports = { connectRedis, getRedis };
