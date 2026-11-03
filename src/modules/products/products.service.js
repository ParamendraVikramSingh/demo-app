const Product = require('../../models/Product');
const { getRedis } = require('../../config/redis');
const { NotFoundError } = require('../../utils/errors');

const SERVICE = 'products';
const CACHE_TTL = 60; // seconds

const getProducts = async ({ q, category, page = 1, limit = 10 }, log) => {
  log.info('Fetching products list', {
    event: 'get_products',
    query: { q, category, page, limit },
    service: SERVICE,
  });

  const query = {};
  if (q) query.$text = { $search: q };
  if (category) query.category = category.toLowerCase();

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [products, total] = await Promise.all([
    Product.find(query).skip(skip).limit(parseInt(limit)).lean(),
    Product.countDocuments(query),
  ]);

  return { products, total, page: parseInt(page), limit: parseInt(limit) };
};

const getProductById = async (id, log) => {
  const cacheKey = `product:${id}`;

  // Try cache first
  try {
    const redis = getRedis();
    const cached = await redis.get(cacheKey);
    if (cached) {
      log.info('Product cache hit', { event: 'product_cache_hit', productId: id, service: SERVICE });
      return JSON.parse(cached);
    }
    log.info('Product cache miss', { event: 'product_cache_miss', productId: id, service: SERVICE });
  } catch (err) {
    log.warn('Redis cache lookup failed, falling through to DB', {
      event: 'redis_cache_lookup_failed',
      error: err.message,
      service: SERVICE,
    });
  }

  // DB lookup
  const product = await Product.findById(id).lean();
  if (!product) throw new NotFoundError('Product not found', SERVICE);

  // Write to cache
  try {
    const redis = getRedis();
    await redis.set(cacheKey, JSON.stringify(product), 'EX', CACHE_TTL);
    log.info('Product written to cache', { event: 'product_cached', productId: id, service: SERVICE });
  } catch (err) {
    log.warn('Redis cache write failed', {
      event: 'redis_cache_write_failed',
      error: err.message,
      service: SERVICE,
    });
  }

  return product;
};

const getSearchSuggestions = async (q, log) => {
  log.info('Fetching search suggestions', { event: 'search_suggestions', query: q, service: SERVICE });

  if (!q || q.trim().length < 1) return [];

  const products = await Product.find(
    { name: { $regex: q.trim(), $options: 'i' } },
    { name: 1 }
  ).limit(10).lean();

  return products.map((p) => p.name);
};

module.exports = { getProducts, getProductById, getSearchSuggestions };
