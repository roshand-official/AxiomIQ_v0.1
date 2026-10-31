const prisma = require('../config/prisma');

class UserRepository {
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        staffProfile: true,
        customerProfile: true,
      },
    });
  }

  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        staffProfile: true,
        customerProfile: true,
      },
    });
  }

  async create(data) {
    return prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
      },
      include: {
        staffProfile: true,
        customerProfile: true,
      },
    });
  }

  async update(id, data) {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        staffProfile: true,
        customerProfile: true,
      },
    });
  }

  async findMany(where = {}, skip = 0, take = 50) {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { staffProfile: true, customerProfile: true },
      }),
      prisma.user.count({ where }),
    ]);
    return { users, total };
  }
}

module.exports = new UserRepository();
