const prisma = require('../config/prisma');

class BillingRepository {
  async createBillingRun(data) {
    return prisma.billingRun.create({
      data,
      include: {
        events: true,
      },
    });
  }

  async updateBillingRun(id, data) {
    return prisma.billingRun.update({
      where: { id },
      data,
    });
  }

  async findBillingRunById(id) {
    return prisma.billingRun.findUnique({
      where: { id },
      include: {
        events: {
          include: {
            customer: true,
            subscription: true,
            invoice: true,
          },
        },
        triggeredBy: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async findBillingRuns({ skip = 0, take = 20 }) {
    const [runs, total] = await Promise.all([
      prisma.billingRun.findMany({
        skip,
        take,
        orderBy: { executionDate: 'desc' },
        include: {
          triggeredBy: { select: { firstName: true, lastName: true } },
          _count: { select: { events: true } },
        },
      }),
      prisma.billingRun.count(),
    ]);

    return { runs, total };
  }

  async createBillingEvent(data) {
    return prisma.billingEvent.create({
      data,
    });
  }

  async hasSubscriptionBilledForDate(subscriptionId, billingDate) {
    const startOfDay = new Date(billingDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(billingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingEvent = await prisma.billingEvent.findFirst({
      where: {
        subscriptionId,
        status: 'SUCCESS',
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return !!existingEvent;
  }
}

module.exports = new BillingRepository();
