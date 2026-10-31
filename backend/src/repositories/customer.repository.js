const prisma = require('../config/prisma');

class CustomerRepository {
  async findById(id) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, isActive: true } },
        assignedStaff: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          orderBy: { invoiceDate: 'desc' },
          take: 5,
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          take: 5,
        },
      },
    });
  }

  async findByCode(customerCode) {
    return prisma.customer.findUnique({
      where: { customerCode },
    });
  }

  async findByEmail(email) {
    return prisma.customer.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findMany({ search, status, type, assignedStaffId, skip = 0, take = 20, orderBy = { createdAt: 'desc' } }) {
    const where = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (assignedStaffId) where.assignedStaffId = assignedStaffId;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { customerCode: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          assignedStaff: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true } },
            },
          },
          _count: {
            select: {
              subscriptions: { where: { status: 'ACTIVE' } },
              invoices: true,
            },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return { customers, total };
  }

  async create(data) {
    return prisma.customer.create({
      data,
      include: {
        assignedStaff: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });
  }

  async update(id, data) {
    return prisma.customer.update({
      where: { id },
      data,
      include: {
        assignedStaff: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });
  }

  async delete(id) {
    return prisma.customer.delete({
      where: { id },
    });
  }

  async updateFinancials(id, { totalInvoiced, amountPaid, outstandingBalance }) {
    return prisma.customer.update({
      where: { id },
      data: {
        ...(totalInvoiced !== undefined && { totalInvoiced }),
        ...(amountPaid !== undefined && { amountPaid }),
        ...(outstandingBalance !== undefined && { outstandingBalance }),
      },
    });
  }
}

module.exports = new CustomerRepository();
