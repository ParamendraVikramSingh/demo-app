const usersService = require('./users.service');
const { sendSuccess } = require('../../utils/response');
const logger = require('../../utils/logger');

const getProfile = async (req, res, next) => {
  const log = logger.withReq(req);
  try {
    const user = await usersService.getProfile(req.user.id, log);
    sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  const log = logger.withReq(req);
  try {
    const user = await usersService.updateProfile(req.user.id, req.body, log);
    sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile };
