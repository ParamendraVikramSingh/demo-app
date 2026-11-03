/**
 * Custom error hierarchy — every error carries statusCode, service, and isOperational flag.
 * isOperational = true  -> show message to client
 * isOperational = false -> generic "Internal Server Error" to client (but full details in logs)
 */

class AppError extends Error {
  constructor(message, statusCode = 500, service = 'unknown') {
    super(message);
    this.statusCode = statusCode;
    this.service = service;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, service) {
    super(message, 400, service);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found', service) {
    super(message, 404, service);
    this.name = 'NotFoundError';
  }
}

class AuthError extends AppError {
  constructor(message = 'Unauthorized', service) {
    super(message, 401, service);
    this.name = 'AuthError';
  }
}

module.exports = { AppError, ValidationError, NotFoundError, AuthError };
