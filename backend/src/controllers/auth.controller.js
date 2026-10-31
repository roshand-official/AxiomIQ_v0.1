const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const result = await authService.registerCustomer(req.body);
      return ApiResponse.created(res, result, 'Account registered successfully');
    } catch (error) {
      next(error);
    }
  }

  async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.requestPasswordReset(email);
      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      return ApiResponse.success(res, req.user, 'Current user profile');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
