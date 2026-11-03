const messagesService = require('./messages.service');
const { sendSuccess } = require('../../utils/response');
const logger = require('../../utils/logger');

const sendMessage = async (req, res, next) => {
  const log = logger.withReq(req);
  try {
    const message = await messagesService.sendMessage(req.user.id, req.body, log);
    sendSuccess(res, { message }, 201);
  } catch (err) {
    next(err);
  }
};

const getConversation = async (req, res, next) => {
  const log = logger.withReq(req);
  try {
    const messages = await messagesService.getConversation(req.user.id, req.params.userId, log);
    sendSuccess(res, { messages });
  } catch (err) {
    next(err);
  }
};

const getInbox = async (req, res, next) => {
  const log = logger.withReq(req);
  try {
    const messages = await messagesService.getInbox(req.user.id, log);
    sendSuccess(res, { messages });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendMessage, getConversation, getInbox };
