const billingService = require('../services/billing.service');
const ApiResponse = require('../utils/apiResponse');

class BillingController {
  async preview(req, res, next) {
    try {
      const { targetDate } = req.query;
      const previewData = await billingService.previewBillingRun(targetDate);
      return ApiResponse.success(res, previewData, 'Billing run preview generated');
    } catch (error) {
      next(error);
    }
  }

  async execute(req, res, next) {
    try {
      const { targetDate } = req.body;
      const result = await billingService.executeBillingRun(targetDate, req.user?.id);
      return ApiResponse.created(res, result, 'Billing run executed successfully');
    } catch (error) {
      next(error);
    }
  }

  async getRuns(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const { runs, total } = await billingService.getBillingRuns(page, limit);
      return ApiResponse.paginated(res, runs, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  async getRunById(req, res, next) {
    try {
      const run = await billingService.getBillingRunById(req.params.id);
      return ApiResponse.success(res, run);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BillingController();
