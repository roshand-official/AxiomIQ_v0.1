const paymentRepository = require('../repositories/payment.repository');
const invoiceRepository = require('../repositories/invoice.repository');
const customerRepository = require('../repositories/customer.repository');
const activityRepository = require('../repositories/activity.repository');
const ApiError = require('../utils/apiError');
const { toDecimal } = require('../utils/currency');

class PaymentService {
  async getAllPayments(filters) {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const { payments, total } = await paymentRepository.findMany({
      search: filters.search,
      status: filters.status,
      method: filters.method,
      customerId: filters.customerId,
      invoiceId: filters.invoiceId,
      skip,
      take: limit,
    });

    return { payments, total, page, limit };
  }

  async getPaymentById(id) {
    const payment = await paymentRepository.findById(id);
    if (!payment) {
      throw ApiError.notFound(`Payment with ID '${id}' not found`);
    }
    return payment;
  }

  /**
   * Register a new payment against an invoice
   */
  async registerPayment(data, actorId) {
    const invoice = await invoiceRepository.findById(data.invoiceId);
    if (!invoice) {
      throw ApiError.notFound(`Invoice '${data.invoiceId}' not found`);
    }

    if (invoice.status === 'PAID') {
      throw ApiError.badRequest('This invoice has already been fully paid.');
    }

    if (invoice.status === 'CANCELLED') {
      throw ApiError.badRequest('Cannot register payment against a cancelled invoice.');
    }

    const paymentAmount = toDecimal(data.amount);
    if (paymentAmount.lte(0)) {
      throw ApiError.badRequest('Payment amount must be greater than zero.');
    }

    const outstanding = toDecimal(invoice.amountOutstanding);
    if (paymentAmount.gt(outstanding)) {
      throw ApiError.badRequest(
        `Payment amount (₹${paymentAmount}) cannot exceed outstanding invoice amount (₹${outstanding}).`
      );
    }

    const paymentNumber = data.paymentNumber || `PAY-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const paymentDate = data.paymentDate ? new Date(data.paymentDate) : new Date();

    // 1. Create Payment record
    const payment = await paymentRepository.create({
      paymentNumber,
      customerId: invoice.customerId,
      invoiceId: invoice.id,
      amount: paymentAmount,
      paymentMethod: data.paymentMethod || 'BANK_TRANSFER',
      paymentDate,
      referenceNumber: data.referenceNumber,
      status: 'SUCCESS',
      notes: data.notes,
      processedById: actorId,
    });

    // 2. Re-calculate Invoice financial totals
    const newAmountPaid = toDecimal(invoice.amountPaid).add(paymentAmount);
    const newOutstanding = toDecimal(invoice.totalAmount).sub(newAmountPaid);
    const newInvoiceStatus = newOutstanding.lte(0) ? 'PAID' : 'PARTIALLY_PAID';

    await invoiceRepository.update(invoice.id, {
      amountPaid: newAmountPaid,
      amountOutstanding: newOutstanding.lt(0) ? toDecimal(0) : newOutstanding,
      status: newInvoiceStatus,
    });

    // 3. Update Customer financial totals
    const customer = await customerRepository.findById(invoice.customerId);
    if (customer) {
      const custPaid = toDecimal(customer.amountPaid).add(paymentAmount);
      const custOutstanding = toDecimal(customer.outstandingBalance).sub(paymentAmount);

      await customerRepository.updateFinancials(customer.id, {
        amountPaid: custPaid,
        outstandingBalance: custOutstanding.lt(0) ? toDecimal(0) : custOutstanding,
      });
    }

    // 4. Audit Log
    await activityRepository.log({
      userId: actorId,
      customerId: invoice.customerId,
      entityType: 'PAYMENT',
      entityId: payment.id,
      action: 'PAYMENT_REGISTERED',
      description: `Registered payment ${payment.paymentNumber} of ₹${paymentAmount} against invoice ${invoice.invoiceNumber}`,
    });

    return payment;
  }
}

module.exports = new PaymentService();
