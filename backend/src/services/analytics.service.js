const prisma = require('../config/prisma');
const { toDecimal } = require('../utils/currency');
const { calculateDaysOverdue } = require('../utils/dateHelper');

class AnalyticsService {
  /**
   * Executive Dashboard KPIs and summary statistics
   */
  async getDashboardKpis() {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // 1. Subscriptions stats
    const subscriptions = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: true },
    });

    let mrr = toDecimal(0);
    subscriptions.forEach((sub) => {
      const amount = toDecimal(sub.recurringAmount);
      // Normalize to monthly
      switch (sub.plan.frequency) {
        case 'DAILY':
          mrr = mrr.add(amount.mul(30));
          break;
        case 'WEEKLY':
          mrr = mrr.add(amount.mul(4.33));
          break;
        case 'MONTHLY':
          mrr = mrr.add(amount.div(sub.plan.interval || 1));
          break;
        case 'YEARLY':
          mrr = mrr.add(amount.div(12 * (sub.plan.interval || 1)));
          break;
        default:
          mrr = mrr.add(amount);
      }
    });

    const arr = mrr.mul(12);

    // 2. Financials from Invoices & Payments
    const [totalInvoicedAgg, totalPaidAgg, overdueInvoices] = await Promise.all([
      prisma.invoice.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _sum: { totalAmount: true },
      }),
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      prisma.invoice.findMany({
        where: {
          dueDate: { lt: now },
          status: { in: ['CONFIRMED', 'PARTIALLY_PAID', 'OVERDUE'] },
          amountOutstanding: { gt: 0 },
        },
      }),
    ]);

    const revenueInvoiced = totalInvoicedAgg._sum.totalAmount || 0;
    const revenueCollected = totalPaidAgg._sum.amount || 0;
    const outstandingPayments = toDecimal(revenueInvoiced).sub(toDecimal(revenueCollected));

    const overdueCount = overdueInvoices.length;
    const overdueAmount = overdueInvoices.reduce(
      (sum, inv) => sum.add(toDecimal(inv.amountOutstanding)),
      toDecimal(0)
    );

    // 3. Upcoming Renewals in next 30 days
    const upcomingRenewalsCount = await prisma.subscription.count({
      where: {
        status: 'ACTIVE',
        expiryDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
    });

    // 4. Billing failures
    const failedBillingCount = await prisma.billingEvent.count({
      where: { status: 'FAILED' },
    });

    // 5. Subscription Status breakdown
    const subStatuses = await prisma.subscription.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const statusMap = subStatuses.reduce((acc, curr) => {
      acc[curr.status] = curr._count._all;
      return acc;
    }, {});

    return {
      kpis: {
        activeSubscriptions: subscriptions.length,
        mrr: Number(mrr.toFixed(2)),
        arr: Number(arr.toFixed(2)),
        revenueCollected: Number(toDecimal(revenueCollected).toFixed(2)),
        revenueInvoiced: Number(toDecimal(revenueInvoiced).toFixed(2)),
        outstandingPayments: Number(outstandingPayments.toFixed(2)),
        overdueInvoicesCount: overdueCount,
        overdueAmount: Number(overdueAmount.toFixed(2)),
        upcomingRenewals: upcomingRenewalsCount,
        failedBillingEvents: failedBillingCount,
      },
      subscriptionBreakdown: statusMap,
    };
  }

  /**
   * Monthly Revenue Trends (Invoiced vs Collected)
   */
  async getRevenueTrends() {
    // Return structured trend data for charts
    const invoices = await prisma.invoice.findMany({
      where: { status: { not: 'CANCELLED' } },
      select: { invoiceDate: true, totalAmount: true },
    });

    const payments = await prisma.payment.findMany({
      where: { status: 'SUCCESS' },
      select: { paymentDate: true, amount: true },
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    const monthlyData = months.map((m, idx) => ({
      month: m,
      invoiced: 0,
      collected: 0,
    }));

    invoices.forEach((inv) => {
      const d = new Date(inv.invoiceDate);
      if (d.getFullYear() === currentYear) {
        monthlyData[d.getMonth()].invoiced += Number(inv.totalAmount);
      }
    });

    payments.forEach((pay) => {
      const d = new Date(pay.paymentDate);
      if (d.getFullYear() === currentYear) {
        monthlyData[d.getMonth()].collected += Number(pay.amount);
      }
    });

    return monthlyData;
  }

  /**
   * Revenue Risk Monitor items
   */
  async getRevenueRisk() {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Overdue invoices
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        dueDate: { lt: now },
        status: { in: ['CONFIRMED', 'PARTIALLY_PAID', 'OVERDUE'] },
        amountOutstanding: { gt: 0 },
      },
      include: { customer: true, subscription: true },
      take: 20,
    });

    // Subscriptions expiring soon
    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        expiryDate: { gte: now, lte: thirtyDaysFromNow },
      },
      include: { customer: true, plan: true },
      take: 20,
    });

    // Failed billing events
    const failedEvents = await prisma.billingEvent.findMany({
      where: { status: 'FAILED' },
      include: { customer: true, subscription: true },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    const riskItems = [];

    overdueInvoices.forEach((inv) => {
      const days = calculateDaysOverdue(inv.dueDate);
      riskItems.push({
        id: `risk-inv-${inv.id}`,
        customerName: inv.customer.name,
        company: inv.customer.company,
        reference: inv.invoiceNumber,
        category: 'OVERDUE_INVOICE',
        amountAtRisk: Number(inv.amountOutstanding),
        severity: days > 30 ? 'HIGH' : days > 15 ? 'MEDIUM' : 'LOW',
        daysOverdue: days,
        recommendedAction: days > 30 ? 'Suspend subscription & send legal notice' : 'Send payment reminder via email/SMS',
        date: inv.dueDate,
      });
    });

    expiringSubscriptions.forEach((sub) => {
      riskItems.push({
        id: `risk-sub-${sub.id}`,
        customerName: sub.customer.name,
        company: sub.customer.company,
        reference: sub.subscriptionNumber,
        category: 'EXPIRING_SUBSCRIPTION',
        amountAtRisk: Number(sub.recurringAmount),
        severity: 'MEDIUM',
        daysOverdue: 0,
        recommendedAction: 'Contact account manager for contract renewal',
        date: sub.expiryDate,
      });
    });

    failedEvents.forEach((ev) => {
      riskItems.push({
        id: `risk-event-${ev.id}`,
        customerName: ev.customer ? ev.customer.name : 'Unknown',
        company: ev.customer ? ev.customer.company : 'Unknown',
        reference: ev.subscription ? ev.subscription.subscriptionNumber : 'N/A',
        category: 'BILLING_FAILURE',
        amountAtRisk: ev.amount ? Number(ev.amount) : 0,
        severity: 'HIGH',
        daysOverdue: 0,
        recommendedAction: `Retry billing run: ${ev.reason || 'Payment gateway failed'}`,
        date: ev.createdAt,
      });
    });

    return riskItems;
  }
}

module.exports = new AnalyticsService();
