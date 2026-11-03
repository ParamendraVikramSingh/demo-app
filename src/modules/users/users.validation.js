const Joi = require('joi');
const { ValidationError } = require('../../utils/errors');

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  email: Joi.string().email(),
}).min(1); // at least one field required

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const msg = error.details.map((d) => d.message).join(', ');
    return next(new ValidationError(msg, 'users'));
  }
  next();
};

module.exports = { updateProfileSchema, validate };
