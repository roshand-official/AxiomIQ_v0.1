const prisma = require('../config/prisma');

class ActivityRepository {
  async log({ userId, customerId, entityType, entityId, action, description, metadata }) {
    return prisma.activityLog.create({
      data: {
        userId,
        customerId,
        entityType,
        entityId,
        action,
        description,
        metadata: metadata || {},
      },
    });
  }

  async getRecentActivities({ limit = 15, customerId, userId }) {
    const where = {};
    if (customerId) where.customerId = customerId;
    if (userId) where.userId = userId;

    return prisma.activityLog.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, role: true } },
        customer: { select: { name: true, company: true } },
      },
    });
  }

  async createNotification({ userId, title, message, type = 'INFO', link }) {
    return prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
      },
    });
  }

  async getNotifications(userId, unreadOnly = false) {
    const where = { userId };
    if (unreadOnly) where.isRead = false;

    return prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }

  async markAsRead(notificationId, userId) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

module.exports = new ActivityRepository();
