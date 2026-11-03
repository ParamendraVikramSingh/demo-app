const { v4: uuidv4 } = require('uuid');

/**
 * MUST be the FIRST middleware registered in app.js
 * Generates a unique requestId per request → enables full log correlation (RCA)
 */
const requestId = (req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-Id', req.id);
  next();
};

module.exports = requestId;
