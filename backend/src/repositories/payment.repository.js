const prisma = require('../config/prisma');

class PaymentRepository {
  async findById(id) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        customer: true,
        invoice: {
          include: {
            subscription: true,
          },
        },
        processedBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async findByNumber(paymentNumber) {
    return prisma.payment.findUnique({
      where: { paymentNumber },
      include: {
        customer: true,
        invoice: true,
      },
    });
  }

  async findMany({ search, status, method, customerId, invoiceId, skip = 0, take = 20 }) {
    const where = {};
    if (status) where.status = status;
    if (method) where.paymentMethod = method;
    if (customerId) where.customerId = customerId;
    if (invoiceId) where.invoiceId = invoiceId;

    if (search) {
      where.OR = [
        { paymentNumber: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { invoice: { invoiceNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy: { paymentDate: 'desc' },
        include: {
          customer: { select: { id: true, name: true, company: true, email: true } },
          invoice: { select: { id: true, invoiceNumber: true, totalAmount: true } },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return { payments, total };
  }

  async create(data) {
    return prisma.payment.create({
      data,
      include: {
        customer: true,
        invoice: true,
      },
    });
  }

  async update(id, data) {
    return prisma.payment.update({
      where: { id },
      data,
      include: {
        customer: true,
        invoice: true,
      },
    });
  }

  async sumSuccessfulPaymentsByInvoice(invoiceId) {
    const aggregate = await prisma.payment.aggregate({
      where: {
        invoiceId,
        status: 'SUCCESS',
      },
      _sum: {
        amount: true,
      },
    });
    return aggregate._sum.amount || 0;
  }
}

module.exports = new PaymentRepository();
