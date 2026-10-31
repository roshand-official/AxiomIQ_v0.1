const ApiError = require('../utils/apiError');

/**
 * Validate incoming request with Zod schema
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} source
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed; // assign validated & cast values
      next();
    } catch (error) {
      if (error.errors) {
        const errorDetails = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return next(ApiError.unprocessable('Validation failed', errorDetails));
      }
      next(error);
    }
  };
};

module.exports = {
  validate,
};
