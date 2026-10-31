const ApiError = require('../utils/apiError');
const config = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Prisma unique constraint violations (P2002)
  if (err.code === 'P2002') {
    const target = err.meta?.target ? err.meta.target.join(', ') : 'field';
    error = ApiError.conflict(`A record with this ${target} already exists.`);
  }

  // Handle Prisma record not found (P2025)
  if (err.code === 'P2025') {
    error = ApiError.notFound('Record not found or already deleted.');
  }

  // Default to 500 if not an instance of ApiError
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  const response = {
    success: false,
    message,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  };

  if (statusCode === 500) {
    console.error('Unhandled Application Error:', err);
  }

  res.status(statusCode).json(response);
};

const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found on this server.`));
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
