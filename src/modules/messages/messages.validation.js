const Joi = require('joi');
const { ValidationError } = require('../../utils/errors');

const sendMessageSchema = Joi.object({
  receiverId: Joi.string().length(24).hex().required().messages({
    'string.length': 'receiverId must be a valid MongoDB ObjectId',
    'string.hex': 'receiverId must be a valid MongoDB ObjectId',
  }),
  content: Joi.string().min(1).max(1000).required(),
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const msg = error.details.map((d) => d.message).join(', ');
    return next(new ValidationError(msg, 'messages'));
  }
  next();
};

module.exports = { sendMessageSchema, validate };
