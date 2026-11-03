const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('./auth.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate, registerSchema, loginSchema } = require('./auth.validation');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

module.exports = router;
