const prisma = require('../config/prisma');

class SubscriptionRepository {
  async findById(id) {
    return prisma.subscription.findUnique({
      where: { id },
      include: {
        customer: true,
        plan: true,
        quotation: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        invoices: {
          orderBy: { invoiceDate: 'desc' },
        },
        billingEvents: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        renewalRequests: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findByNumber(subscriptionNumber) {
    return prisma.subscription.findUnique({
      where: { subscriptionNumber },
      include: {
        customer: true,
        plan: true,
        items: { include: { product: true, variant: true } },
      },
    });
  }

  async findMany({ search, status, planId, customerId, skip = 0, take = 20, orderBy = { createdAt: 'desc' } }) {
    const where = {};
    if (status) where.status = status;
    if (planId) where.planId = planId;
    if (customerId) where.customerId = customerId;

    if (search) {
      where.OR = [
        { subscriptionNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { company: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          customer: { select: { id: true, name: true, company: true, email: true } },
          plan: { select: { id: true, name: true, frequency: true, basePrice: true } },
          _count: { select: { items: true, invoices: true } },
        },
      }),
      prisma.subscription.count({ where }),
    ]);

    return { subscriptions, total };
  }

  async findDueForBilling(targetDate) {
    return prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        nextBillingDate: {
          lte: new Date(targetDate),
        },
      },
      include: {
        customer: true,
        plan: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
  }

  async create(data) {
    const { items, ...subData } = data;
    return prisma.subscription.create({
      data: {
        ...subData,
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
    const { items, ...subData } = data;
    return prisma.subscription.update({
      where: { id },
      data: subData,
      include: {
        customer: true,
        plan: true,
        items: { include: { product: true, variant: true } },
      },
    });
  }

  async count(where = {}) {
    return prisma.subscription.count({ where });
  }

  async countByStatus() {
    const statuses = await prisma.subscription.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    return statuses.reduce((acc, curr) => {
      acc[curr.status] = curr._count._all;
      return acc;
    }, {});
  }
}

module.exports = new SubscriptionRepository();
