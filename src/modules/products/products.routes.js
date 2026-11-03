const express = require('express');
const router = express.Router();
const { getProducts, getProductById, getSearchSuggestions } = require('./products.controller');

// NOTE: /search/suggestions MUST be registered before /:id to avoid being matched as an id
router.get('/search/suggestions', getSearchSuggestions);
router.get('/', getProducts);
router.get('/:id', getProductById);

module.exports = router;
