const Order = require('../../models/Order');
const Cart = require('../../models/Cart');
const { NotFoundError, AppError } = require('../../utils/errors');

const SERVICE = 'orders';

/**
 * Simulates calling an external payment provider.
 * Logs before + after (success or failure) — critical for RCA dashboards.
 */
const simulatePaymentAPI = async (orderId, amount, log) => {
  log.info('Payment provider request started', {
    event: 'payment_provider_request_started',
    orderId: orderId.toString(),
    amount,
    service: SERVICE,
  });

  const delayMs = parseInt(process.env.PAYMENT_TIMEOUT_MS || '500', 10);
  const shouldFail =
    process.env.PAYMENT_RANDOM_FAIL === 'true' && Math.random() < 0.3;

  await new Promise((resolve) => setTimeout(resolve, delayMs));

  if (shouldFail) {
    log.error('Payment provider request failed', {
      event: 'payment_provider_request_failed',
      orderId: orderId.toString(),
      amount,
      reason: 'random_failure',
      service: SERVICE,
    });
    throw new AppError('Payment provider failed', 502, SERVICE);
  }

  const result = {
    transactionId: `txn_${Date.now()}`,
    status: 'success',
    amount,
    processedAt: new Date().toISOString(),
  };

  log.info('Payment provider request completed', {
    event: 'payment_provider_request_completed',
    orderId: orderId.toString(),
    transactionId: result.transactionId,
    amount,
    service: SERVICE,
  });

  return result;
};

const createOrder = async (userId, log) => {
  log.info('Create order attempt', { event: 'order_create_attempt', userId, service: SERVICE });

  const cart = await Cart.findOne({ userId }).populate('items.productId');
  if (!cart || cart.items.length === 0) {
    throw new AppError('Cart is empty', 400, SERVICE);
  }

  const items = cart.items.map((item) => ({
    productId: item.productId._id,
    name: item.productId.name,
    price: item.productId.price,
    quantity: item.quantity,
  }));

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await Order.create({ userId, items, totalAmount });

  // Clear cart after order created
  cart.items = [];
  await cart.save();

  log.info('Order created successfully', {
    event: 'order_created',
    userId,
    orderId: order._id,
    totalAmount,
    itemCount: items.length,
    service: SERVICE,
  });

  return order;
};

const payOrder = async (orderId, userId, log) => {
  log.info('Pay order attempt', { event: 'pay_order_attempt', orderId, userId, service: SERVICE });

  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) throw new NotFoundError('Order not found', SERVICE);

  if (order.paymentStatus === 'paid') {
    throw new AppError('Order already paid', 400, SERVICE);
  }

  let paymentResult;
  try {
    paymentResult = await simulatePaymentAPI(order._id, order.totalAmount, log);
  } catch (err) {
    order.paymentStatus = 'failed';
    await order.save();
    log.error('Order payment failed, status set to failed', {
      event: 'order_payment_failed',
      orderId,
      error: err.message,
      service: SERVICE,
    });
    throw err;
  }

  order.paymentStatus = 'paid';
  order.paymentDetails = paymentResult;
  await order.save();

  log.info('Order payment successful', {
    event: 'order_payment_success',
    orderId,
    transactionId: paymentResult.transactionId,
    service: SERVICE,
  });

  return order;
};

const getOrder = async (orderId, userId, log) => {
  log.info('Fetching order', { event: 'get_order', orderId, userId, service: SERVICE });
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) throw new NotFoundError('Order not found', SERVICE);
  return order;
};

module.exports = { createOrder, payOrder, getOrder };
