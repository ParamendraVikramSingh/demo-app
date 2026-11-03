const Cart = require('../../models/Cart');
const Product = require('../../models/Product');
const { NotFoundError, AppError } = require('../../utils/errors');

const SERVICE = 'cart';

const addToCart = async (userId, { productId, quantity = 1 }, log) => {
  log.info('Add to cart attempt', { event: 'cart_add_attempt', userId, productId, quantity, service: SERVICE });

  const product = await Product.findById(productId);
  if (!product) throw new NotFoundError('Product not found', SERVICE);

  if (product.stock < quantity) {
    throw new AppError(`Only ${product.stock} items in stock`, 400, SERVICE);
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  const existingItem = cart.items.find((i) => i.productId.toString() === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity });
  }

  await cart.save();
  log.info('Item added to cart', { event: 'cart_item_added', userId, productId, quantity, service: SERVICE });

  return cart;
};

const getCart = async (userId, log) => {
  log.info('Fetching cart', { event: 'cart_fetch', userId, service: SERVICE });
  const cart = await Cart.findOne({ userId }).populate('items.productId', 'name price imageUrl');
  return cart || { userId, items: [] };
};

const removeFromCart = async (userId, productId, log) => {
  log.info('Remove from cart attempt', { event: 'cart_remove_attempt', userId, productId, service: SERVICE });

  const cart = await Cart.findOne({ userId });
  if (!cart) throw new NotFoundError('Cart not found', SERVICE);

  const before = cart.items.length;
  cart.items = cart.items.filter((i) => i.productId.toString() !== productId);

  if (cart.items.length === before) {
    throw new NotFoundError('Product not in cart', SERVICE);
  }

  await cart.save();
  log.info('Item removed from cart', { event: 'cart_item_removed', userId, productId, service: SERVICE });
  return cart;
};

module.exports = { addToCart, getCart, removeFromCart };
