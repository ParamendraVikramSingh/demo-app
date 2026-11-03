const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const env = require('../../config/env');
const { getRedis } = require('../../config/redis');
const { AuthError, ValidationError, NotFoundError, AppError } = require('../../utils/errors');

const SERVICE = 'auth';
const SESSION_TTL = 60 * 60; // 1 hour in seconds

const register = async ({ name, email, password }, log) => {
  log.info('Register attempt', { event: 'user_register_attempt', email, service: SERVICE });

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ValidationError('Email already registered', SERVICE);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });

  log.info('User registered successfully', {
    event: 'user_register_success',
    email,
    userId: user._id,
    service: SERVICE,
  });

  return { id: user._id, name: user.name, email: user.email, role: user.role };
};

const login = async ({ email, password }, log) => {
  log.info('Login attempt', { event: 'login_attempt', email, service: SERVICE });

  const user = await User.findOne({ email });
  if (!user) {
    log.warn('Login failed - user not found', {
      event: 'login_failed',
      email,
      reason: 'user_not_found',
      service: SERVICE,
    });
    throw new AuthError('Invalid credentials', SERVICE);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    log.warn('Login failed - wrong password', {
      event: 'login_failed',
      email,
      reason: 'wrong_password',
      service: SERVICE,
    });
    throw new AuthError('Invalid credentials', SERVICE);
  }

  const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  // Write session to Redis
  try {
    const redis = getRedis();
    await redis.set(`session:${user._id}`, JSON.stringify({ userId: user._id, email }), 'EX', SESSION_TTL);
    log.info('Session created in Redis', { event: 'session_created', userId: user._id, service: SERVICE });
  } catch (err) {
    log.error('Redis session write failed', {
      event: 'redis_session_write_failed',
      userId: user._id,
      error: err.message,
      service: SERVICE,
    });
    throw new AppError('Redis connection failed', 500, SERVICE);
  }

  log.info('Login successful', { event: 'login_success', email, userId: user._id, service: SERVICE });

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

const logout = async (userId, log) => {
  try {
    const redis = getRedis();
    await redis.del(`session:${userId}`);
    log.info('Session deleted', { event: 'logout_success', userId, service: SERVICE });
  } catch (err) {
    log.warn('Redis session deletion failed', {
      event: 'redis_session_delete_failed',
      userId,
      error: err.message,
      service: SERVICE,
    });
  }
};

const getMe = async (userId, log) => {
  log.info('Get current user', { event: 'get_me', userId, service: SERVICE });
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) throw new NotFoundError('User not found', SERVICE);
  return user;
};

module.exports = { register, login, logout, getMe };
