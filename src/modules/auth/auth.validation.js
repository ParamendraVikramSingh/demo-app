const Joi = require('joi');
const { ValidationError } = require('../../utils/errors');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const msg = error.details.map((d) => d.message).join(', ');
    return next(new ValidationError(msg, 'auth'));
  }
  next();
};

module.exports = { registerSchema, loginSchema, validate };
