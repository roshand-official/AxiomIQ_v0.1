const subscriptionRepository = require('../repositories/subscription.repository');
const activityRepository = require('../repositories/activity.repository');
const ApiError = require('../utils/apiError');
const { calculateNextBillingDate } = require('../utils/dateHelper');

class SubscriptionService {
  async getAllSubscriptions(filters) {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const { subscriptions, total } = await subscriptionRepository.findMany({
      search: filters.search,
      status: filters.status,
      planId: filters.planId,
      customerId: filters.customerId,
      skip,
      take: limit,
    });

    return { subscriptions, total, page, limit };
  }

  async getSubscriptionById(id) {
    const subscription = await subscriptionRepository.findById(id);
    if (!subscription) {
      throw ApiError.notFound(`Subscription with ID '${id}' not found`);
    }
    return subscription;
  }

  async createSubscription(data, actorId) {
    const subNumber = data.subscriptionNumber || `SUB-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const startDate = data.startDate ? new Date(data.startDate) : new Date();
    const expiryDate = data.expiryDate ? new Date(data.expiryDate) : calculateNextBillingDate(startDate, 'YEARLY', 1);
    const nextBillingDate = data.nextBillingDate ? new Date(data.nextBillingDate) : calculateNextBillingDate(startDate, 'MONTHLY', 1);

    const subscription = await subscriptionRepository.create({
      ...data,
      subscriptionNumber: subNumber,
      startDate,
      expiryDate,
      nextBillingDate,
    });

    await activityRepository.log({
      userId: actorId,
      customerId: data.customerId,
      entityType: 'SUBSCRIPTION',
      entityId: subscription.id,
      action: 'CREATED',
      description: `Created subscription ${subscription.subscriptionNumber}`,
    });

    return subscription;
  }

  /**
   * Update subscription lifecycle status
   */
  async updateStatus(id, newStatus, reason = null, actorId) {
    const subscription = await this.getSubscriptionById(id);
    const validTransitions = {
      DRAFT: ['QUOTATION', 'CONFIRMED', 'CANCELLED'],
      QUOTATION: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['ACTIVE', 'CANCELLED'],
      ACTIVE: ['PAUSED', 'CLOSED', 'EXPIRED'],
      PAUSED: ['ACTIVE', 'CLOSED'],
      CLOSED: [],
      EXPIRED: ['ACTIVE'], // renewal
    };

    const allowed = validTransitions[subscription.status] || [];
    if (!allowed.includes(newStatus)) {
      throw ApiError.badRequest(
        `Invalid status transition from '${subscription.status}' to '${newStatus}'. Allowed: [${allowed.join(', ')}]`
      );
    }

    const updateData = { status: newStatus };
    if (newStatus === 'PAUSED') {
      updateData.pauseReason = reason || 'Customer requested pause';
    } else if (newStatus === 'CLOSED') {
      updateData.closeReason = reason || 'Customer requested early closure';
      updateData.closedAt = new Date();
    } else if (newStatus === 'ACTIVE') {
      updateData.pauseReason = null;
    }

    const updated = await subscriptionRepository.update(id, updateData);

    await activityRepository.log({
      userId: actorId,
      customerId: subscription.customerId,
      entityType: 'SUBSCRIPTION',
      entityId: id,
      action: 'STATUS_CHANGE',
      description: `Transitioned subscription ${subscription.subscriptionNumber} to ${newStatus}${reason ? ` (${reason})` : ''}`,
    });

    return updated;
  }

  /**
   * Renew subscription
   */
  async renewSubscription(id, durationMonths = 12, actorId) {
    const subscription = await this.getSubscriptionById(id);

    const currentExpiry = new Date(subscription.expiryDate);
    const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
    const newExpiryDate = new Date(baseDate);
    newExpiryDate.setMonth(newExpiryDate.getMonth() + parseInt(durationMonths, 10));

    const updated = await subscriptionRepository.update(id, {
      expiryDate: newExpiryDate,
      status: 'ACTIVE',
    });

    await activityRepository.log({
      userId: actorId,
      customerId: subscription.customerId,
      entityType: 'SUBSCRIPTION',
      entityId: id,
      action: 'RENEWED',
      description: `Renewed subscription ${subscription.subscriptionNumber} for ${durationMonths} months. New expiry: ${newExpiryDate.toISOString().split('T')[0]}`,
    });

    return updated;
  }
}

module.exports = new SubscriptionService();
