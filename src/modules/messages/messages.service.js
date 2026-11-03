const Message = require('../../models/Message');
const { AppError } = require('../../utils/errors');

const SERVICE = 'messages';

const sendMessage = async (senderId, { receiverId, content }, log) => {
  log.info('Send message attempt', { event: 'message_send_attempt', senderId, receiverId, service: SERVICE });

  // Simulated DB write fail (for failure scenario demos)
  if (process.env.SIMULATE_MSG_FAIL === 'true') {
    log.error('Simulated DB write failure on message send', {
      event: 'message_db_write_failed',
      senderId,
      receiverId,
      service: SERVICE,
    });
    throw new AppError('Database write failed (simulated)', 500, SERVICE);
  }

  const message = await Message.create({ senderId, receiverId, content });

  log.info('Message sent successfully', {
    event: 'message_sent',
    messageId: message._id,
    senderId,
    receiverId,
    service: SERVICE,
  });

  return message;
};

const getConversation = async (userId, otherUserId, log) => {
  log.info('Fetching conversation', { event: 'get_conversation', userId, otherUserId, service: SERVICE });

  const messages = await Message.find({
    $or: [
      { senderId: userId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: userId },
    ],
  })
    .sort({ createdAt: 1 })
    .lean();

  log.info('Conversation fetched', {
    event: 'conversation_fetched',
    userId,
    otherUserId,
    messageCount: messages.length,
    service: SERVICE,
  });

  return messages;
};

const getInbox = async (userId, log) => {
  log.info('Fetching inbox', { event: 'get_inbox', userId, service: SERVICE });

  const messages = await Message.find({
    $or: [{ senderId: userId }, { receiverId: userId }],
  })
    .sort({ createdAt: -1 })
    .populate('senderId', 'name email')
    .populate('receiverId', 'name email')
    .lean();

  log.info('Inbox fetched', { event: 'inbox_fetched', userId, messageCount: messages.length, service: SERVICE });
  return messages;
};

module.exports = { sendMessage, getConversation, getInbox };
