const prisma = require('../config/prisma');
const ApiError = require('../utils/apiError');
const activityRepository = require('../repositories/activity.repository');

class PortalService {
  /**
   * Customer portal overview dashboard
   */
  async getPortalDashboard(customerId) {
    if (!customerId) throw ApiError.badRequest('Customer ID is required');

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          orderBy: { invoiceDate: 'desc' },
          take: 5,
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          take: 5,
        },
      },
    });

    if (!customer) throw ApiError.notFound('Customer profile not found');

    const activeSubs = customer.subscriptions.filter((s) => s.status === 'ACTIVE');
    const upcomingRenewals = activeSubs.filter((s) => {
      const exp = new Date(s.expiryDate);
      const diff = (exp - new Date()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 45;
    });

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        company: customer.company,
        email: customer.email,
        phone: customer.phone,
        totalInvoiced: customer.totalInvoiced,
        amountPaid: customer.amountPaid,
        outstandingBalance: customer.outstandingBalance,
      },
      summary: {
        activeSubscriptionsCount: activeSubs.length,
        upcomingRenewalsCount: upcomingRenewals.length,
        outstandingBalance: customer.outstandingBalance,
      },
      recentSubscriptions: customer.subscriptions,
      recentInvoices: customer.invoices,
      recentPayments: customer.payments,
    };
  }

  async getMySubscriptions(customerId) {
    return prisma.subscription.findMany({
      where: { customerId },
      include: {
        plan: true,
        items: { include: { product: true, variant: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyInvoices(customerId) {
    return prisma.invoice.findMany({
      where: { customerId },
      include: {
        subscription: true,
        items: true,
        payments: true,
      },
      orderBy: { invoiceDate: 'desc' },
    });
  }

  async getMyPayments(customerId) {
    return prisma.payment.findMany({
      where: { customerId },
      include: {
        invoice: true,
      },
      orderBy: { paymentDate: 'desc' },
    });
  }

  /**
   * Request renewal for a subscription
   */
  async requestRenewal(customerId, subscriptionId, durationMonths = 12, notes = '') {
    const subscription = await prisma.subscription.findFirst({
      where: { id: subscriptionId, customerId },
    });

    if (!subscription) {
      throw ApiError.notFound('Subscription not found under your customer account');
    }

    const request = await prisma.renewalRequest.create({
      data: {
        customerId,
        subscriptionId,
        requestedDurationMonths: parseInt(durationMonths, 10) || 12,
        notes,
      },
    });

    await activityRepository.createNotification({
      title: 'New Renewal Request',
      message: `Customer requested renewal for subscription ${subscription.subscriptionNumber}`,
      type: 'INFO',
    });

    return request;
  }
}

module.exports = new PortalService();
