const express = require('express');
const router = express.Router();
const { addToCart, getCart, removeFromCart } = require('./cart.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.post('/add', authenticate, addToCart);
router.get('/', authenticate, getCart);
router.delete('/:productId', authenticate, removeFromCart);

module.exports = router;
