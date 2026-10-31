const prisma = require('../config/prisma');

class DiscountRepository {
  async findById(id) {
    return prisma.discount.findUnique({
      where: { id },
      include: { product: true },
    });
  }

  async findByCode(code) {
    return prisma.discount.findUnique({
      where: { code: code.toUpperCase() },
      include: { product: true },
    });
  }

  async findMany({ search, isActive, type, skip = 0, take = 50 }) {
    const where = {};
    if (isActive !== undefined) where.isActive = isActive;
    if (type) where.type = type;

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [discounts, total] = await Promise.all([
      prisma.discount.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { product: true },
      }),
      prisma.discount.count({ where }),
    ]);

    return { discounts, total };
  }

  async create(data) {
    return prisma.discount.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
      },
      include: { product: true },
    });
  }

  async update(id, data) {
    return prisma.discount.update({
      where: { id },
      data: {
        ...data,
        ...(data.code && { code: data.code.toUpperCase() }),
      },
      include: { product: true },
    });
  }

  async incrementUsage(id) {
    return prisma.discount.update({
      where: { id },
      data: {
        currentUsage: { increment: 1 },
      },
    });
  }
}

module.exports = new DiscountRepository();
