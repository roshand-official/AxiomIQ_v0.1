const discountService = require('../services/discount.service');
const ApiResponse = require('../utils/apiResponse');

class DiscountController {
  async getAll(req, res, next) {
    try {
      const { discounts, total, page, limit } = await discountService.getAllDiscounts(req.query);
      return ApiResponse.paginated(res, discounts, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const discount = await discountService.getDiscountById(req.params.id);
      return ApiResponse.success(res, discount);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const discount = await discountService.createDiscount(req.body, req.user?.id);
      return ApiResponse.created(res, discount, 'Discount rule created successfully');
    } catch (error) {
      next(error);
    }
  }

  async validateCode(req, res, next) {
    try {
      const { code, amount, quantity, productId } = req.body;
      const result = await discountService.validateAndCalculate(code, amount, quantity, productId);
      return ApiResponse.success(res, result, 'Discount is valid');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DiscountController();
