const prisma = require('../config/prisma');

class PlanRepository {
  async findById(id) {
    return prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subscriptions: { where: { status: 'ACTIVE' } },
          },
        },
      },
    });
  }

  async findByCode(code) {
    return prisma.subscriptionPlan.findUnique({
      where: { code },
    });
  }

  async findMany({ search, frequency, isActive, skip = 0, take = 50 }) {
    const where = {};
    if (frequency) where.frequency = frequency;
    if (isActive !== undefined) where.isActive = isActive;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [plans, total] = await Promise.all([
      prisma.subscriptionPlan.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              subscriptions: { where: { status: 'ACTIVE' } },
            },
          },
        },
      }),
      prisma.subscriptionPlan.count({ where }),
    ]);

    return { plans, total };
  }

  async create(data) {
    return prisma.subscriptionPlan.create({
      data,
    });
  }

  async update(id, data) {
    return prisma.subscriptionPlan.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    return prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

module.exports = new PlanRepository();
