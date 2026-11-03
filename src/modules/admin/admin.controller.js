const adminService = require('./admin.service');
const { sendSuccess } = require('../../utils/response');
const logger = require('../../utils/logger');

const healthCheck = async (req, res, next) => {
  const log = logger.withReq(req);
  try {
    const health = await adminService.healthCheck(log);
    sendSuccess(res, health);
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  const log = logger.withReq(req);
  try {
    const stats = adminService.getAdminStats(log);
    sendSuccess(res, stats);
  } catch (err) {
    next(err);
  }
};

const simulateError = async (req, res, next) => {
  const log = logger.withReq(req);
  const { type } = req.body || {};

  if (!type) {
    return next(
      require('../../utils/errors').AppError
        ? new (require('../../utils/errors').AppError)('Body must include { "type": "db|redis|timeout|crash" }', 400, 'admin')
        : new Error('Missing type')
    );
  }

  try {
    const result = await adminService.simulateError(type, log);
    // For crash, we still send the response before the process exits
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { healthCheck, getStats, simulateError };
