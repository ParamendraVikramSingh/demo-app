const sendSuccess = (res, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

const sendError = (res, { message = 'Internal Server Error', statusCode = 500 } = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = { sendSuccess, sendError };
