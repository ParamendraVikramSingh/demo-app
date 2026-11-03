const ordersService = require('./orders.service');
const { sendSuccess } = require('../../utils/response');
const logger = require('../../utils/logger');

const createOrder = async (req, res, next) => {
  const log = logger.withReq(req);
  try {
    const order = await ordersService.createOrder(req.user.id, log);
    sendSuccess(res, { order }, 201);
  } catch (err) {
    next(err);
  }
};

const payOrder = async (req, res, next) => {
  const log = logger.withReq(req);
  try {
    const order = await ordersService.payOrder(req.params.id, req.user.id, log);
    sendSuccess(res, { order });
  } catch (err) {
    next(err);
  }
};

const getOrder = async (req, res, next) => {
  const log = logger.withReq(req);
  try {
    const order = await ordersService.getOrder(req.params.id, req.user.id, log);
    sendSuccess(res, { order });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, payOrder, getOrder };
