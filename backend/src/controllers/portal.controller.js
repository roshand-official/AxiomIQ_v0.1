const portalService = require('../services/portal.service');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class PortalController {
  getCustomerId(req) {
    const customerId = req.user.customerId;
    if (!customerId) {
      throw ApiError.forbidden('You are not associated with a customer account.');
    }
    return customerId;
  }

  async getDashboard(req, res, next) {
    try {
      const customerId = this.getCustomerId(req);
      const data = await portalService.getPortalDashboard(customerId);
      return ApiResponse.success(res, data, 'Customer portal dashboard');
    } catch (error) {
      next(error);
    }
  }

  async getSubscriptions(req, res, next) {
    try {
      const customerId = this.getCustomerId(req);
      const subs = await portalService.getMySubscriptions(customerId);
      return ApiResponse.success(res, subs, 'Customer subscriptions');
    } catch (error) {
      next(error);
    }
  }

  async getInvoices(req, res, next) {
    try {
      const customerId = this.getCustomerId(req);
      const invoices = await portalService.getMyInvoices(customerId);
      return ApiResponse.success(res, invoices, 'Customer invoices');
    } catch (error) {
      next(error);
    }
  }

  async getPayments(req, res, next) {
    try {
      const customerId = this.getCustomerId(req);
      const payments = await portalService.getMyPayments(customerId);
      return ApiResponse.success(res, payments, 'Customer payment history');
    } catch (error) {
      next(error);
    }
  }

  async requestRenewal(req, res, next) {
    try {
      const customerId = this.getCustomerId(req);
      const { subscriptionId, durationMonths, notes } = req.body;
      const request = await portalService.requestRenewal(customerId, subscriptionId, durationMonths, notes);
      return ApiResponse.created(res, request, 'Renewal request submitted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PortalController();
