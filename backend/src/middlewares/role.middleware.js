const ApiError = require('../utils/apiError');

/**
 * Role-Based Access Control Middleware
 * @param  {...string} allowedRoles - E.g. 'ADMIN', 'STAFF', 'CUSTOMER'
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Role '${req.user.role}' is not authorized for this resource.`
        )
      );
    }

    next();
  };
};

/**
 * Customer Tenant Isolation Middleware:
 * If the current user is a CUSTOMER, ensures they can only view or modify their own customer records.
 */
const requireCustomerOwnership = (paramKey = 'customerId') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    if (req.user.role === 'ADMIN' || req.user.role === 'STAFF') {
      return next(); // Admins and staff have wider operational clearance
    }

    if (req.user.role === 'CUSTOMER') {
      const targetCustomerId = req.params[paramKey] || req.query[paramKey] || req.body[paramKey];
      if (targetCustomerId && targetCustomerId !== req.user.customerId) {
        return next(ApiError.forbidden('Access restricted to your own customer portal account.'));
      }
    }

    next();
  };
};

module.exports = {
  authorize,
  requireCustomerOwnership,
};
