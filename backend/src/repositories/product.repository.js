const prisma = require('../config/prisma');

class ProductRepository {
  async findById(id) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        variants: { where: { isActive: true } },
      },
    });
  }

  async findByInternalRef(internalRef) {
    return prisma.product.findUnique({
      where: { internalRef },
      include: { variants: true },
    });
  }

  async findMany({ search, type, isActive, skip = 0, take = 50 }) {
    const where = {};
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { internalRef: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          variants: true,
          _count: { select: { subscriptionItems: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async create(data) {
    const { variants, ...productData } = data;
    return prisma.product.create({
      data: {
        ...productData,
        ...(variants && variants.length > 0 && {
          variants: {
            create: variants,
          },
        }),
      },
      include: { variants: true },
    });
  }

  async update(id, data) {
    const { variants, ...productData } = data;
    return prisma.product.update({
      where: { id },
      data: productData,
      include: { variants: true },
    });
  }

  async addVariant(productId, variantData) {
    return prisma.productVariant.create({
      data: {
        ...variantData,
        productId,
      },
    });
  }

  async updateVariant(variantId, data) {
    return prisma.productVariant.update({
      where: { id: variantId },
      data,
    });
  }

  async delete(id) {
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

module.exports = new ProductRepository();
