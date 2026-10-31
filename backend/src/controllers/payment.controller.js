const paymentService = require('../services/payment.service');
const ApiResponse = require('../utils/apiResponse');

class PaymentController {
  async getAll(req, res, next) {
    try {
      const { payments, total, page, limit } = await paymentService.getAllPayments(req.query);
      return ApiResponse.paginated(res, payments, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const payment = await paymentService.getPaymentById(req.params.id);
      return ApiResponse.success(res, payment);
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const payment = await paymentService.registerPayment(req.body, req.user?.id);
      return ApiResponse.created(res, payment, 'Payment registered successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
