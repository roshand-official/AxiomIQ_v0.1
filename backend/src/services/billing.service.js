const subscriptionRepository = require('../repositories/subscription.repository');
const invoiceRepository = require('../repositories/invoice.repository');
const customerRepository = require('../repositories/customer.repository');
const billingRepository = require('../repositories/billing.repository');
const activityRepository = require('../repositories/activity.repository');
const ApiError = require('../utils/apiError');
const { toDecimal, calculateTax } = require('../utils/currency');
const { calculateNextBillingDate, addDays } = require('../utils/dateHelper');

class BillingService {
  /**
   * Preview eligible subscriptions for a given billing date
   */
  async previewBillingRun(targetDate = new Date()) {
    const date = new Date(targetDate);
    const eligibleSubscriptions = await subscriptionRepository.findDueForBilling(date);

    const eligible = [];
    const excluded = [];

    for (const sub of eligibleSubscriptions) {
      const alreadyBilled = await billingRepository.hasSubscriptionBilledForDate(sub.id, date);
      if (alreadyBilled) {
        excluded.push({
          subscriptionId: sub.id,
          subscriptionNumber: sub.subscriptionNumber,
          customerName: sub.customer.name,
          reason: 'Already billed for this billing period',
        });
      } else if (!sub.items || sub.items.length === 0) {
        excluded.push({
          subscriptionId: sub.id,
          subscriptionNumber: sub.subscriptionNumber,
          customerName: sub.customer.name,
          reason: 'Subscription has no active product items',
        });
      } else {
        eligible.push({
          subscriptionId: sub.id,
          subscriptionNumber: sub.subscriptionNumber,
          customerName: sub.customer.name,
          planName: sub.plan.name,
          frequency: sub.plan.frequency,
          nextBillingDate: sub.nextBillingDate,
          amount: sub.recurringAmount,
        });
      }
    }

    const estimatedTotal = eligible.reduce(
      (sum, item) => sum.add(toDecimal(item.amount)),
      toDecimal(0)
    );

    return {
      targetDate: date.toISOString().split('T')[0],
      totalEligibleCount: eligible.length,
      totalExcludedCount: excluded.length,
      estimatedTotalInvoiced: estimatedTotal,
      eligible,
      excluded,
    };
  }

  /**
   * Execute automated billing run
   */
  async executeBillingRun(targetDate = new Date(), actorId = null) {
    const startTime = Date.now();
    const date = new Date(targetDate);
    const runNumber = `BR-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;

    const eligibleSubscriptions = await subscriptionRepository.findDueForBilling(date);

    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    let totalInvoiced = toDecimal(0);
    const createdInvoices = [];
    const logs = [];

    // Create BillingRun in IN_PROGRESS state
    const billingRun = await billingRepository.createBillingRun({
      runNumber,
      billingDate: date,
      status: 'IN_PROGRESS',
      triggeredById: actorId,
    });

    for (const sub of eligibleSubscriptions) {
      try {
        // Prevention of double billing
        const alreadyBilled = await billingRepository.hasSubscriptionBilledForDate(sub.id, date);
        if (alreadyBilled) {
          skippedCount++;
          await billingRepository.createBillingEvent({
            billingRunId: billingRun.id,
            subscriptionId: sub.id,
            customerId: sub.customerId,
            status: 'SKIPPED',
            reason: 'Already billed for this billing period',
          });
          continue;
        }

        if (!sub.items || sub.items.length === 0) {
          skippedCount++;
          await billingRepository.createBillingEvent({
            billingRunId: billingRun.id,
            subscriptionId: sub.id,
            customerId: sub.customerId,
            status: 'SKIPPED',
            reason: 'Subscription has no product items',
          });
          continue;
        }

        // Calculate line items for invoice
        let subtotal = toDecimal(0);
        let taxTotal = toDecimal(0);

        const invoiceItems = sub.items.map((item) => {
          const itemSubtotal = toDecimal(item.subtotal);
          const itemTax = toDecimal(item.taxAmount || 0);
          subtotal = subtotal.add(itemSubtotal);
          taxTotal = taxTotal.add(itemTax);

          return {
            productId: item.productId,
            variantId: item.variantId,
            description: item.product ? item.product.name : 'Subscription Service',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            taxAmount: itemTax,
            discount: toDecimal(0),
            subtotal: itemSubtotal,
          };
        });

        const invoiceTotal = subtotal.add(taxTotal);
        const invoiceNumber = `INV-${date.getFullYear()}-${Date.now().toString().slice(-4)}${successCount}`;
        const dueDate = addDays(date, sub.paymentTerms === 'NET_15' ? 15 : 30);

        // Create Invoice record
        const invoice = await invoiceRepository.create({
          invoiceNumber,
          customerId: sub.customerId,
          subscriptionId: sub.id,
          status: 'CONFIRMED',
          invoiceDate: date,
          dueDate,
          subtotal,
          taxAmount: taxTotal,
          discountAmount: toDecimal(0),
          totalAmount: invoiceTotal,
          amountPaid: toDecimal(0),
          amountOutstanding: invoiceTotal,
          items: invoiceItems,
        });

        // Advance subscription nextBillingDate & record lastBilledDate
        const nextBilling = calculateNextBillingDate(
          sub.nextBillingDate,
          sub.plan.frequency,
          sub.plan.interval
        );

        await subscriptionRepository.update(sub.id, {
          lastBilledDate: date,
          nextBillingDate: nextBilling,
        });

        // Update customer account balance
        const customer = await customerRepository.findById(sub.customerId);
        if (customer) {
          await customerRepository.updateFinancials(customer.id, {
            totalInvoiced: toDecimal(customer.totalInvoiced).add(invoiceTotal),
            outstandingBalance: toDecimal(customer.outstandingBalance).add(invoiceTotal),
          });
        }

        // Record successful event
        await billingRepository.createBillingEvent({
          billingRunId: billingRun.id,
          subscriptionId: sub.id,
          customerId: sub.customerId,
          invoiceId: invoice.id,
          status: 'SUCCESS',
          amount: invoiceTotal,
        });

        successCount++;
        totalInvoiced = totalInvoiced.add(invoiceTotal);
        createdInvoices.push({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          subscriptionNumber: sub.subscriptionNumber,
          customerName: sub.customer.name,
          totalAmount: invoiceTotal,
        });
      } catch (err) {
        failedCount++;
        logs.push(`Failed for subscription ${sub.subscriptionNumber}: ${err.message}`);
        await billingRepository.createBillingEvent({
          billingRunId: billingRun.id,
          subscriptionId: sub.id,
          customerId: sub.customerId,
          status: 'FAILED',
          reason: err.message,
        });
      }
    }

    const durationMs = Date.now() - startTime;

    // Finalize BillingRun
    const completedRun = await billingRepository.updateBillingRun(billingRun.id, {
      totalProcessed: eligibleSubscriptions.length,
      successCount,
      failedCount,
      skippedCount,
      totalInvoiced,
      durationMs,
      status: failedCount > 0 && successCount === 0 ? 'FAILED' : 'COMPLETED',
      logs: logs.join('\n'),
    });

    await activityRepository.log({
      userId: actorId,
      entityType: 'BILLING_RUN',
      entityId: completedRun.id,
      action: 'EXECUTED',
      description: `Executed billing run ${completedRun.runNumber}: ${successCount} invoices generated, ₹${totalInvoiced} invoiced`,
    });

    return {
      billingRun: completedRun,
      summary: {
        totalProcessed: eligibleSubscriptions.length,
        successCount,
        failedCount,
        skippedCount,
        totalInvoiced,
        durationMs,
      },
      createdInvoices,
    };
  }

  async getBillingRuns(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return billingRepository.findBillingRuns({ skip, take: limit });
  }

  async getBillingRunById(id) {
    const run = await billingRepository.findBillingRunById(id);
    if (!run) throw ApiError.notFound('Billing run not found');
    return run;
  }
}

module.exports = new BillingService();
