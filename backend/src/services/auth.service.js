const jwt = require('jsonwebtoken');
const config = require('../config/env');
const userRepository = require('../repositories/user.repository');
const activityRepository = require('../repositories/activity.repository');
const ApiError = require('../utils/apiError');
const { validatePasswordPolicy, hashPassword, comparePassword } = require('../utils/password');

class AuthService {
  /**
   * User login with email and password
   */
  async login(email, password) {
    if (!email || !password) {
      throw ApiError.badRequest('Email and password are required');
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account is currently disabled. Contact administrator.');
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Update last login timestamp
    await userRepository.update(user.id, { lastLoginAt: new Date() });

    // Generate JWT token
    const token = this.generateToken(user);

    // Audit log
    await activityRepository.log({
      userId: user.id,
      entityType: 'USER',
      entityId: user.id,
      action: 'LOGIN',
      description: `User ${user.email} signed in successfully`,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        staffId: user.staffProfile ? user.staffProfile.id : null,
        customerId: user.customerProfile ? user.customerProfile.id : null,
      },
    };
  }

  /**
   * Register a new customer user (with strict password policy)
   */
  async registerCustomer({ email, password, firstName, lastName, phone, companyName }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw ApiError.conflict('An account with this email address already exists');
    }

    const policy = validatePasswordPolicy(password);
    if (!policy.isValid) {
      throw ApiError.badRequest(policy.message);
    }

    const passwordHash = await hashPassword(password);

    const user = await userRepository.create({
      email,
      passwordHash,
      role: 'CUSTOMER',
      firstName,
      lastName,
      phone,
    });

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  /**
   * Request password reset link simulation
   */
  async requestPasswordReset(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Return success simulation to prevent user enumeration
      return { message: 'If this email is registered, a password reset link has been dispatched.' };
    }

    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetTokenExp = new Date(Date.now() + 3600000); // 1 hour

    await userRepository.update(user.id, { resetToken, resetTokenExp });

    return {
      message: 'Password reset link dispatched to registered email address.',
      simulatedToken: resetToken,
    };
  }

  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }
}

module.exports = new AuthService();
