const jwt = require('jsonwebtoken');
const { AuthError } = require('../utils/errors');
const env = require('../config/env');
const { getRedis } = require('../config/redis');

/**
 * Validates Bearer JWT and checks that the session still exists in Redis.
 * Logout deletes the Redis key, immediately invalidating the token.
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AuthError('No token provided', 'auth'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Check Redis session still alive
    const redis = getRedis();
    const session = await redis.get(`session:${decoded.id}`);

    if (!session) {
      return next(new AuthError('Session expired or logged out', 'auth'));
    }

    req.user = decoded;
    next();
  } catch (err) {
    return next(new AuthError('Invalid or expired token', 'auth'));
  }
};

module.exports = { authenticate };
