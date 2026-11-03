const express = require('express');
const router = express.Router();
const { healthCheck, getStats, simulateError } = require('./admin.controller');

// Public endpoints (no auth — health checks should always be reachable)
router.get('/health', healthCheck);
router.get('/admin/stats', getStats);
router.post('/admin/simulate-error', simulateError);

module.exports = router;
