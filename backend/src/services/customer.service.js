const customerRepository = require('../repositories/customer.repository');
const activityRepository = require('../repositories/activity.repository');
const ApiError = require('../utils/apiError');

class CustomerService {
  async getAllCustomers(filters) {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const { customers, total } = await customerRepository.findMany({
      search: filters.search,
      status: filters.status,
      type: filters.type,
      assignedStaffId: filters.assignedStaffId,
      skip,
      take: limit,
    });

    return { customers, total, page, limit };
  }

  async getCustomerById(id) {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw ApiError.notFound(`Customer with ID '${id}' not found`);
    }
    return customer;
  }

  async createCustomer(data, actorId) {
    const existing = await customerRepository.findByEmail(data.email);
    if (existing) {
      throw ApiError.conflict('A customer with this email already exists');
    }

    // Auto-generate customerCode if not supplied: CUST-YYYY-XXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const customerCode = data.customerCode || `CUST-${new Date().getFullYear()}-${randomSuffix}`;

    const customer = await customerRepository.create({
      ...data,
      customerCode,
      country: data.country || 'India',
    });

    await activityRepository.log({
      userId: actorId,
      customerId: customer.id,
      entityType: 'CUSTOMER',
      entityId: customer.id,
      action: 'CREATED',
      description: `Created customer profile for ${customer.name} (${customer.company})`,
    });

    return customer;
  }

  async updateCustomer(id, data, actorId) {
    await this.getCustomerById(id);

    const updated = await customerRepository.update(id, data);

    await activityRepository.log({
      userId: actorId,
      customerId: id,
      entityType: 'CUSTOMER',
      entityId: id,
      action: 'UPDATED',
      description: `Updated customer information for ${updated.name}`,
    });

    return updated;
  }

  async deleteCustomer(id, actorId) {
    await this.getCustomerById(id);
    const deleted = await customerRepository.delete(id);

    await activityRepository.log({
      userId: actorId,
      entityType: 'CUSTOMER',
      entityId: id,
      action: 'DELETED',
      description: `Removed customer record ${id}`,
    });

    return deleted;
  }
}

module.exports = new CustomerService();
