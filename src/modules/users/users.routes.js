const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('./users.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate, updateProfileSchema } = require('./users.validation');

router.get('/profile', authenticate, getProfile);
router.patch('/profile', authenticate, validate(updateProfileSchema), updateProfile);

module.exports = router;
