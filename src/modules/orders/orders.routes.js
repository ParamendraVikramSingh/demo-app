const express = require('express');
const router = express.Router();
const { createOrder, payOrder, getOrder } = require('./orders.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.post('/create', authenticate, createOrder);
router.post('/:id/pay', authenticate, payOrder);
router.get('/:id', authenticate, getOrder);

module.exports = router;
