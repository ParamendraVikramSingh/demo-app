const mongoose = require('mongoose');
const { getRedis } = require('../../config/redis');
const { getStats } = require('../../utils/stats');
const { AppError } = require('../../utils/errors');

const SERVICE = 'admin';

const healthCheck = async (log) => {
  log.info('Health check requested', { event: 'health_check', service: SERVICE });

  const dbStatus = mongoose.connection.readyState === 1 ? 'up' : 'down';

  let redisStatus = 'down';
  try {
    const redis = getRedis();
    await redis.ping();
    redisStatus = 'up';
  } catch (err) {
    log.warn('Redis health check failed', {
      event: 'redis_health_check_failed',
      error: err.message,
      service: SERVICE,
    });
  }

  const result = {
    db: dbStatus,
    redis: redisStatus,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  };

  const overallLevel = dbStatus === 'down' || redisStatus === 'down' ? 'warn' : 'info';
  log[overallLevel]('Health check completed', { event: 'health_check_result', ...result, service: SERVICE });

  return result;
};

const getAdminStats = (log) => {
  log.info('Admin stats requested', { event: 'admin_stats_fetch', service: SERVICE });
  return getStats();
};

const simulateError = async (type, log) => {
  log.warn('Error simulation triggered', { event: 'simulate_error_triggered', type, service: SERVICE });

  switch (type) {
    case 'db': {
      await mongoose.disconnect();
      log.error('Simulated DB disconnect', { event: 'simulate_db_failure', service: SERVICE });
      return { simulated: 'db_disconnect' };
    }
    case 'redis': {
      const redis = getRedis();
      redis.disconnect();
      log.error('Simulated Redis disconnect', { event: 'simulate_redis_failure', service: SERVICE });
      return { simulated: 'redis_disconnect' };
    }
    case 'timeout': {
      log.warn('Simulated timeout — holding response for 30s', {
        event: 'simulate_timeout_start',
        service: SERVICE,
      });
      await new Promise((resolve) => setTimeout(resolve, 30000));
      log.warn('Simulated timeout completed', { event: 'simulate_timeout_end', service: SERVICE });
      return { simulated: 'timeout_30s' };
    }
    case 'crash': {
      log.error('Simulated crash — calling process.exit(1)', {
        event: 'simulate_crash',
        service: SERVICE,
      });
      setTimeout(() => process.exit(1), 150); // slight delay to let the log flush
      return { simulated: 'crash_imminent' };
    }
    default:
      throw new AppError(`Unknown simulation type: "${type}". Valid: db|redis|timeout|crash`, 400, SERVICE);
  }
};

module.exports = { healthCheck, getAdminStats, simulateError };
