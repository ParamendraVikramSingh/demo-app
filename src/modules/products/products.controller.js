const productsService = require('./products.service');
const { sendSuccess } = require('../../utils/response');
const logger = require('../../utils/logger');

const getProducts = async (req, res, next) => {
  const log = logger.withReq(req);
  try {
    const result = await productsService.getProducts(req.query, log);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  const log = logger.withReq(req);
  try {
    const product = await productsService.getProductById(req.params.id, log);
    sendSuccess(res, { product });
  } catch (err) {
    next(err);
  }
};

const getSearchSuggestions = async (req, res, next) => {
  const log = logger.withReq(req);
  try {
    const suggestions = await productsService.getSearchSuggestions(req.query.q || '', log);
    sendSuccess(res, { suggestions });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getProductById, getSearchSuggestions };
