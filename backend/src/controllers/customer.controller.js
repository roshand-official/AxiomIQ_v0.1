const customerService = require('../services/customer.service');
const ApiResponse = require('../utils/apiResponse');

class CustomerController {
  async getAll(req, res, next) {
    try {
      const { customers, total, page, limit } = await customerService.getAllCustomers(req.query);
      return ApiResponse.paginated(res, customers, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const customer = await customerService.getCustomerById(req.params.id);
      return ApiResponse.success(res, customer);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const customer = await customerService.createCustomer(req.body, req.user?.id);
      return ApiResponse.created(res, customer, 'Customer created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await customerService.updateCustomer(req.params.id, req.body, req.user?.id);
      return ApiResponse.success(res, updated, 'Customer updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await customerService.deleteCustomer(req.params.id, req.user?.id);
      return ApiResponse.success(res, null, 'Customer removed successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomerController();
