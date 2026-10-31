const subscriptionService = require('../services/subscription.service');
const ApiResponse = require('../utils/apiResponse');

class SubscriptionController {
  async getAll(req, res, next) {
    try {
      const { subscriptions, total, page, limit } = await subscriptionService.getAllSubscriptions(req.query);
      return ApiResponse.paginated(res, subscriptions, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const subscription = await subscriptionService.getSubscriptionById(req.params.id);
      return ApiResponse.success(res, subscription);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const subscription = await subscriptionService.createSubscription(req.body, req.user?.id);
      return ApiResponse.created(res, subscription, 'Subscription created successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status, reason } = req.body;
      const updated = await subscriptionService.updateStatus(req.params.id, status, reason, req.user?.id);
      return ApiResponse.success(res, updated, `Subscription transitioned to ${status}`);
    } catch (error) {
      next(error);
    }
  }

  async renew(req, res, next) {
    try {
      const { durationMonths } = req.body;
      const renewed = await subscriptionService.renewSubscription(req.params.id, durationMonths, req.user?.id);
      return ApiResponse.success(res, renewed, 'Subscription renewed successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SubscriptionController();
