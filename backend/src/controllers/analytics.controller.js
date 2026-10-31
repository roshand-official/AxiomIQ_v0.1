const analyticsService = require('../services/analytics.service');
const ApiResponse = require('../utils/apiResponse');

class AnalyticsController {
  async getDashboardKpis(req, res, next) {
    try {
      const data = await analyticsService.getDashboardKpis();
      return ApiResponse.success(res, data, 'Dashboard KPIs retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getRevenueTrends(req, res, next) {
    try {
      const data = await analyticsService.getRevenueTrends();
      return ApiResponse.success(res, data, 'Revenue trend data retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getRevenueRisk(req, res, next) {
    try {
      const data = await analyticsService.getRevenueRisk();
      return ApiResponse.success(res, data, 'Revenue risk monitor data retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
