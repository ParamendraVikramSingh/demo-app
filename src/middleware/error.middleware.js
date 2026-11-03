const logger = require('../utils/logger');
const { sendError } = require('../utils/response');
const { increment } = require('../utils/stats');

/**
 * Centralized error handler — must be last middleware in app.js
 * Emits a structured "error" type log with full context for RCA.
 */
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const service = err.service || 'unknown';

  increment('errorCount');

  logger.error(err.message, {
    type: 'error',
    requestId: req.id,
    service,
    endpoint: req.originalUrl,
    method: req.method,
    status: statusCode,
    stack: err.stack,
  });

  sendError(res, {
    message: err.isOperational ? err.message : 'Internal Server Error',
    statusCode,
  });
};

module.exports = errorMiddleware;
