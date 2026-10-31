const staffService = require('../services/staff.service');
const ApiResponse = require('../utils/apiResponse');

class StaffController {
  async getAll(req, res, next) {
    try {
      const { staff, total, page, limit } = await staffService.getAllStaff(req.query);
      return ApiResponse.paginated(res, staff, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const staffMember = await staffService.getStaffById(req.params.id);
      return ApiResponse.success(res, staffMember);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const staff = await staffService.createStaff(req.body, req.user?.id);
      return ApiResponse.created(res, staff, 'Staff member onboarded successfully');
    } catch (error) {
      next(error);
    }
  }

  async assignCustomers(req, res, next) {
    try {
      const { customerIds } = req.body;
      const result = await staffService.assignCustomers(req.params.id, customerIds, req.user?.id);
      return ApiResponse.success(res, result, 'Customers assigned successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StaffController();
