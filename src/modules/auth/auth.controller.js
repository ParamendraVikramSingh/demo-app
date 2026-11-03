const authService = require('./auth.service');
const { sendSuccess } = require('../../utils/response');
const logger = require('../../utils/logger');

const register = async (req, res, next) => {
  const log = logger.withReq(req);
  try {
    const user = await authService.register(req.body, log);
    sendSuccess(res, { user }, 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  const log = logger.withReq(req);
  try {
    const result = await authService.login(req.body, log);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  const log = logger.withReq(req);
  try {
    await authService.logout(req.user.id, log);
    sendSuccess(res, { message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  const log = logger.withReq(req);
  try {
    const user = await authService.getMe(req.user.id, log);
    sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, getMe };
