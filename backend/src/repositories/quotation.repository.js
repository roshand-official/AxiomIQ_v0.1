const prisma = require('../config/prisma');

class QuotationRepository {
  async findById(id) {
    return prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        plan: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        subscription: true,
      },
    });
  }

  async findByNumber(quotationNumber) {
    return prisma.quotation.findUnique({
      where: { quotationNumber },
      include: {
        customer: true,
        plan: true,
        items: { include: { product: true, variant: true } },
      },
    });
  }

  async findMany({ search, status, customerId, skip = 0, take = 20 }) {
    const where = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    if (search) {
      where.OR = [
        { quotationNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { company: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        skip,
        take,
        orderBy: { quotationDate: 'desc' },
        include: {
          customer: { select: { id: true, name: true, company: true, email: true } },
          plan: { select: { id: true, name: true, frequency: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.quotation.count({ where }),
    ]);

    return { quotations, total };
  }

  async create(data) {
    const { items, ...quotationData } = data;
    return prisma.quotation.create({
      data: {
        ...quotationData,
        ...(items && items.length > 0 && {
          items: {
            create: items,
          },
        }),
      },
      include: {
        customer: true,
        plan: true,
        items: { include: { product: true, variant: true } },
      },
    });
  }

  async update(id, data) {
    const { items, ...quotationData } = data;
    return prisma.quotation.update({
      where: { id },
      data: quotationData,
      include: {
        customer: true,
        plan: true,
        items: { include: { product: true, variant: true } },
      },
    });
  }

  async count(where = {}) {
    return prisma.quotation.count({ where });
  }
}

module.exports = new QuotationRepository();
