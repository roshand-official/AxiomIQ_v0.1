const staffRepository = require('../repositories/staff.repository');
const userRepository = require('../repositories/user.repository');
const customerRepository = require('../repositories/customer.repository');
const activityRepository = require('../repositories/activity.repository');
const ApiError = require('../utils/apiError');
const { hashPassword, validatePasswordPolicy } = require('../utils/password');

class StaffService {
  async getAllStaff(filters) {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const { staffList, total } = await staffRepository.findMany({
      search: filters.search,
      isActive: filters.isActive !== undefined ? filters.isActive === 'true' : undefined,
      skip,
      take: limit,
    });

    return { staff: staffList, total, page, limit };
  }

  async getStaffById(id) {
    const staff = await staffRepository.findById(id);
    if (!staff) throw ApiError.notFound('Staff member not found');
    return staff;
  }

  async createStaff(data, actorId) {
    // 1. Verify email
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw ApiError.conflict('A user account with this email already exists.');
    }

    // 2. Validate password
    const policy = validatePasswordPolicy(data.password);
    if (!policy.isValid) {
      throw ApiError.badRequest(policy.message);
    }

    const passwordHash = await hashPassword(data.password);

    // 3. Create User account with role STAFF
    const user = await userRepository.create({
      email: data.email,
      passwordHash,
      role: 'STAFF',
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    });

    // 4. Create Staff profile
    const employeeCode = data.employeeCode || `EMP-${Date.now().toString().slice(-4)}`;
    const staff = await staffRepository.create({
      userId: user.id,
      employeeCode,
      designation: data.designation || 'Account Representative',
      department: data.department || 'Operations',
    });

    await activityRepository.log({
      userId: actorId,
      entityType: 'STAFF',
      entityId: staff.id,
      action: 'CREATED',
      description: `Created staff member ${user.firstName} ${user.lastName} (${employeeCode})`,
    });

    return staff;
  }

  async assignCustomers(staffId, customerIds, actorId) {
    const staff = await this.getStaffById(staffId);

    for (const custId of customerIds) {
      await customerRepository.update(custId, { assignedStaffId: staff.id });
    }

    await activityRepository.log({
      userId: actorId,
      entityType: 'STAFF',
      entityId: staff.id,
      action: 'CUSTOMERS_ASSIGNED',
      description: `Assigned ${customerIds.length} customer(s) to ${staff.user.firstName} ${staff.user.lastName}`,
    });

    return { message: 'Customers assigned successfully.' };
  }
}

module.exports = new StaffService();
