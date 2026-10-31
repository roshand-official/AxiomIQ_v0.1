const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Validates password meets Brightloop business rules:
 * - More than 8 characters (> 8)
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one special character
 */
const validatePasswordPolicy = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      message: 'Password is required',
    };
  }

  if (password.length <= 8) {
    return {
      isValid: false,
      message: 'Password must be more than eight characters',
    };
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpper || !hasLower || !hasSpecial) {
    return {
      isValid: false,
      message: 'Password must contain an uppercase letter, a lowercase letter, and a special character',
    };
  }

  return { isValid: true };
};

const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

module.exports = {
  validatePasswordPolicy,
  hashPassword,
  comparePassword,
};
