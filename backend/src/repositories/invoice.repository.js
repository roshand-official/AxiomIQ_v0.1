const prisma = require('../config/prisma');

class InvoiceRepository {
  async findById(id) {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        subscription: {
          include: { plan: true },
        },
        items: {
          include: { product: true, variant: true },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });
  }

  async findByNumber(invoiceNumber) {
    return prisma.invoice.findUnique({
      where: { invoiceNumber },
      include: {
        customer: true,
        subscription: true,
        items: true,
        payments: true,
      },
    });
  }

  async findMany({ search, status, customerId, subscriptionId, isOverdue, skip = 0, take = 20 }) {
    const where = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (subscriptionId) where.subscriptionId = subscriptionId;

    if (isOverdue) {
      where.dueDate = { lt: new Date() };
      where.status = { in: ['CONFIRMED', 'PARTIALLY_PAID', 'OVERDUE'] };
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { company: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take,
        orderBy: { invoiceDate: 'desc' },
        include: {
          customer: { select: { id: true, name: true, company: true, email: true } },
          subscription: { select: { id: true, subscriptionNumber: true } },
          _count: { select: { items: true, payments: true } },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return { invoices, total };
  }

  async create(data) {
    const { items, ...invoiceData } = data;
    return prisma.invoice.create({
      data: {
        ...invoiceData,
        ...(items && items.length > 0 && {
          items: {
            create: items,
          },
        }),
      },
      include: {
        customer: true,
        subscription: true,
        items: true,
      },
    });
  }

  async update(id, data) {
    const { items, ...invoiceData } = data;
    return prisma.invoice.update({
      where: { id },
      data: invoiceData,
      include: {
        customer: true,
        subscription: true,
        items: true,
        payments: true,
      },
    });
  }

  async count(where = {}) {
    return prisma.invoice.count({ where });
  }

  async getOverdueInvoices() {
    return prisma.invoice.findMany({
      where: {
        dueDate: { lt: new Date() },
        status: { in: ['CONFIRMED', 'PARTIALLY_PAID', 'OVERDUE'] },
        amountOutstanding: { gt: 0 },
      },
      include: {
        customer: true,
        subscription: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }
}

module.exports = new InvoiceRepository();
