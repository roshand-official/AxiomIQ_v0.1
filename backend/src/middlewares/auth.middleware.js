const jwt = require('jsonwebtoken');
const config = require('../config/env');
const prisma = require('../config/prisma');
const ApiError = require('../utils/apiError');

/**
 * Authentication middleware: verifies JWT and loads active user context
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication token missing or invalid format');
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Session has expired. Please log in again.');
      }
      throw ApiError.unauthorized('Invalid authentication token');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        staffProfile: true,
        customerProfile: true,
      },
    });

    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User account is inactive or no longer exists');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      staffId: user.staffProfile ? user.staffProfile.id : null,
      customerId: user.customerProfile ? user.customerProfile.id : null,
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
};
