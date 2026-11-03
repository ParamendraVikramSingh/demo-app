const express = require('express');
const router = express.Router();

const authRoutes = require('../modules/auth/auth.routes');
const usersRoutes = require('../modules/users/users.routes');
const productsRoutes = require('../modules/products/products.routes');
const cartRoutes = require('../modules/cart/cart.routes');
const ordersRoutes = require('../modules/orders/orders.routes');
const messagesRoutes = require('../modules/messages/messages.routes');
const adminRoutes = require('../modules/admin/admin.routes');

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/products', productsRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', ordersRoutes);
router.use('/messages', messagesRoutes);

// Admin routes mount at root level (so /health, /admin/stats, /admin/simulate-error)
router.use('/', adminRoutes);

module.exports = router;
