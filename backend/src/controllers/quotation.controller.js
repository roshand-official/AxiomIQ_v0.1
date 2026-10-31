const quotationService = require('../services/quotation.service');
const ApiResponse = require('../utils/apiResponse');

class QuotationController {
  async getAll(req, res, next) {
    try {
      const { quotations, total, page, limit } = await quotationService.getAllQuotations(req.query);
      return ApiResponse.paginated(res, quotations, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const quotation = await quotationService.getQuotationById(req.params.id);
      return ApiResponse.success(res, quotation);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const quotation = await quotationService.createQuotation(req.body, req.user?.id);
      return ApiResponse.created(res, quotation, 'Quotation generated successfully');
    } catch (error) {
      next(error);
    }
  }

  async convertToSubscription(req, res, next) {
    try {
      const subscription = await quotationService.convertToSubscription(req.params.id, req.user?.id);
      return ApiResponse.success(res, subscription, 'Quotation successfully converted to active subscription');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QuotationController();
