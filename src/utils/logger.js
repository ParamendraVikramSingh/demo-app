const fs = require('fs');
const path = require('path');
const winston = require('winston');
const env = require('../config/env');
const { createLogFingerprint } = require("./logFingerprint");
const logsDir = path.resolve(__dirname, '../../logs');
const appLogPath = path.join(logsDir, 'app.log');
const accessLogPath = path.join(logsDir, 'access.log');

const typeFilter = (predicate) =>
  winston.format((info) => (predicate(info) ? info : false))();

const addFingerprintFormat = winston.format((info) => {
  info.fingerprint = createLogFingerprint(info);
  return info;
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
    winston.format.errors({stack:true}),
    addFingerprintFormat(),
    winston.format.json()
  ),
  // Default fields added to EVERY log entry
  defaultMeta: {
    service: env.SERVICE_NAME,
    environment: env.NODE_ENV,
  },
  transports: [new winston.transports.Console()],
});

if (env.LOG_TO_FILE) {
  fs.mkdirSync(logsDir, { recursive: true });

  logger.add(
    new winston.transports.File({
      filename: appLogPath,
      format: winston.format.combine(
        typeFilter((info) => info.type !== 'access'),
        winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
        winston.format.json()
      ),
    })
  );

  logger.add(
    new winston.transports.File({
      filename: accessLogPath,
      format: winston.format.combine(
        typeFilter((info) => info.type === 'access'),
        winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
        winston.format.json()
      ),
    })
  );
}

/**
 * Returns a thin wrapper that auto-injects requestId from req.id
 * Usage: const log = logger.withReq(req); log.info('msg', { event: 'x', service: 'y' });
 */
logger.withReq = (req) => ({
  info: (msg, meta = {}) => logger.info(msg, { requestId: req.id, type: 'app', ...meta }),
  warn: (msg, meta = {}) => logger.warn(msg, { requestId: req.id, type: 'app', ...meta }),
  error: (msg, meta = {}) => logger.error(msg, { requestId: req.id, type: 'app', ...meta }),
});

module.exports = logger;
