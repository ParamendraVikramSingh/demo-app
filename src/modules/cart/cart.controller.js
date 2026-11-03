const cartService = require('./cart.service');
const { sendSuccess } = require('../../utils/response');
const logger = require('../../utils/logger');

const addToCart = async (req, res, next) => {
  const log = logger.withReq(req);
  try {
    const cart = await cartService.addToCart(req.user.id, req.body, log);
    sendSuccess(res, { cart });
  } catch (err) {
    next(err);
  }
};

const getCart = async (req, res, next) => {
  const log = logger.withReq(req);
  try {
    const cart = await cartService.getCart(req.user.id, log);
    sendSuccess(res, { cart });
  } catch (err) {
    next(err);
  }
};

const removeFromCart = async (req, res, next) => {
  const log = logger.withReq(req);
  try {
    const cart = await cartService.removeFromCart(req.user.id, req.params.productId, log);
    sendSuccess(res, { cart });
  } catch (err) {
    next(err);
  }
};

module.exports = { addToCart, getCart, removeFromCart };
