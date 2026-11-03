const express = require('express');
const router = express.Router();
const { sendMessage, getConversation, getInbox } = require('./messages.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate, sendMessageSchema } = require('./messages.validation');

router.post('/send', authenticate, validate(sendMessageSchema), sendMessage);
router.get('/inbox', authenticate, getInbox);
router.get('/conversation/:userId', authenticate, getConversation);

module.exports = router;
