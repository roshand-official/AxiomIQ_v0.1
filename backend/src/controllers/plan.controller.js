const planService = require('../services/plan.service');
const ApiResponse = require('../utils/apiResponse');

class PlanController {
  async getAll(req, res, next) {
    try {
      const { plans, total, page, limit } = await planService.getAllPlans(req.query);
      return ApiResponse.paginated(res, plans, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const plan = await planService.getPlanById(req.params.id);
      return ApiResponse.success(res, plan);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const plan = await planService.createPlan(req.body, req.user?.id);
      return ApiResponse.created(res, plan, 'Subscription plan created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await planService.updatePlan(req.params.id, req.body, req.user?.id);
      return ApiResponse.success(res, updated, 'Subscription plan updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PlanController();
