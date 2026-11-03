const logger = require('../utils/logger');
const { increment } = require('../utils/stats');
const env = require('../config/env');

/**
 * Access log emitted on every response finish.
 * level = "warn" if responseTime > SLOW_THRESHOLD_MS, else "info"
 * Also emits a second "slow_endpoint_detected" app/warn log for RCA filtering.
 */
const loggerMiddleware = (req, res, next) => {
  const startTime = Date.now();

  increment('totalRequests');

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const isSlowRequest = responseTime > env.SLOW_THRESHOLD_MS;
    const level = isSlowRequest ? 'warn' : 'info';

    // ── Access log ──────────────────────────────────────────────────────────
    logger.log(level, 'HTTP Request', {
      type: 'access',
      requestId: req.id,
      method: req.method,
      endpoint: req.originalUrl,
      status: res.statusCode,
      responseTime,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    // ── Slow endpoint warning (additional app-level log for RCA dashboards) ─
    if (isSlowRequest) {
      logger.warn('Slow endpoint detected', {
        type: 'app',
        requestId: req.id,
        event: 'slow_endpoint_detected',
        service: 'http',
        endpoint: req.originalUrl,
        responseTime,
      });
    }
  });

  next();
};

module.exports = loggerMiddleware;
