const prisma = require('../config/prisma');

class StaffRepository {
  async findById(id) {
    return prisma.staff.findUnique({
      where: { id },
      include: {
        user: true,
        assignedCustomers: true,
      },
    });
  }

  async findByUserId(userId) {
    return prisma.staff.findUnique({
      where: { userId },
      include: {
        user: true,
        assignedCustomers: true,
      },
    });
  }

  async findMany({ search, isActive, skip = 0, take = 50 }) {
    const where = {};
    if (isActive !== undefined) where.isActive = isActive;

    if (search) {
      where.OR = [
        { employeeCode: { contains: search, mode: 'insensitive' } },
        { designation: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [staffList, total] = await Promise.all([
      prisma.staff.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              role: true,
              lastLoginAt: true,
            },
          },
          _count: {
            select: { assignedCustomers: true },
          },
        },
      }),
      prisma.staff.count({ where }),
    ]);

    return { staffList, total };
  }

  async create(data) {
    return prisma.staff.create({
      data,
      include: {
        user: true,
      },
    });
  }

  async update(id, data) {
    return prisma.staff.update({
      where: { id },
      data,
      include: {
        user: true,
        assignedCustomers: true,
      },
    });
  }
}

module.exports = new StaffRepository();
