const mongoose = require('mongoose');

// logger is required lazily to avoid circular dependency at startup
let logger;
const getLogger = () => {
  if (!logger) logger = require('../utils/logger');
  return logger;
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    getLogger().info('MongoDB connected', { type: 'app', event: 'db_connected', service: 'db' });
  } catch (err) {
    getLogger().error('MongoDB connection failed', {
      type: 'app',
      event: 'db_connect_failed',
      service: 'db',
      error: err.message,
    });
    throw err;
  }

  mongoose.connection.on('disconnected', () => {
    getLogger().warn('MongoDB disconnected', { type: 'app', event: 'db_disconnected', service: 'db' });
  });

  mongoose.connection.on('error', (err) => {
    getLogger().error('MongoDB error', { type: 'app', event: 'db_error', service: 'db', error: err.message });
  });
};

module.exports = { connectDB };
