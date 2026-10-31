const invoiceService = require('../services/invoice.service');
const ApiResponse = require('../utils/apiResponse');

class InvoiceController {
  async getAll(req, res, next) {
    try {
      const { invoices, total, page, limit } = await invoiceService.getAllInvoices(req.query);
      return ApiResponse.paginated(res, invoices, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const invoice = await invoiceService.getInvoiceById(req.params.id);
      return ApiResponse.success(res, invoice);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const updated = await invoiceService.updateStatus(req.params.id, status, req.user?.id);
      return ApiResponse.success(res, updated, `Invoice status updated to ${status}`);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InvoiceController();
