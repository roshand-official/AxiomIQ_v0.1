const quotationRepository = require('../repositories/quotation.repository');
const subscriptionRepository = require('../repositories/subscription.repository');
const productRepository = require('../repositories/product.repository');
const customerRepository = require('../repositories/customer.repository');
const activityRepository = require('../repositories/activity.repository');
const ApiError = require('../utils/apiError');
const { toDecimal, calculateLineSubtotal, calculateTax } = require('../utils/currency');
const { calculateNextBillingDate } = require('../utils/dateHelper');

class QuotationService {
  async getAllQuotations(filters) {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const { quotations, total } = await quotationRepository.findMany({
      search: filters.search,
      status: filters.status,
      customerId: filters.customerId,
      skip,
      take: limit,
    });

    return { quotations, total, page, limit };
  }

  async getQuotationById(id) {
    const quotation = await quotationRepository.findById(id);
    if (!quotation) {
      throw ApiError.notFound(`Quotation with ID '${id}' not found`);
    }
    return quotation;
  }

  async createQuotation(data, actorId) {
    const customer = await customerRepository.findById(data.customerId);
    if (!customer) throw ApiError.notFound('Customer not found');

    const quotationNumber = data.quotationNumber || `QT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const validityDays = parseInt(data.validityDays, 10) || 30;
    const quotationDate = data.quotationDate ? new Date(data.quotationDate) : new Date();
    const expiryDate = new Date(quotationDate.getTime() + validityDays * 24 * 60 * 60 * 1000);

    let subtotal = toDecimal(0);
    let totalTax = toDecimal(0);

    // Compute line items
    const items = await Promise.all(
      (data.items || []).map(async (item) => {
        const product = await productRepository.findById(item.productId);
        if (!product) throw ApiError.notFound(`Product ${item.productId} not found`);

        let unitPrice = toDecimal(product.salesPrice);
        if (item.variantId) {
          const variant = product.variants.find((v) => v.id === item.variantId);
          if (variant) unitPrice = toDecimal(variant.salesPrice);
        }

        const quantity = parseInt(item.quantity, 10) || 1;
        const lineSubtotal = calculateLineSubtotal(quantity, unitPrice);
        const taxRate = item.taxRate !== undefined ? toDecimal(item.taxRate) : toDecimal(18.0);
        const taxAmount = calculateTax(lineSubtotal, taxRate);
        const discountAmount = toDecimal(item.discountAmount || 0);

        subtotal = subtotal.add(lineSubtotal);
        totalTax = totalTax.add(taxAmount);

        return {
          productId: item.productId,
          variantId: item.variantId || null,
          description: item.description || product.name,
          quantity,
          unitPrice,
          taxRate,
          taxAmount,
          discountAmount,
          subtotal: lineSubtotal,
        };
      })
    );

    const overallDiscount = toDecimal(data.discountAmount || 0);
    const totalAmount = subtotal.add(totalTax).sub(overallDiscount);

    const quotation = await quotationRepository.create({
      quotationNumber,
      customerId: data.customerId,
      planId: data.planId,
      createdById: actorId,
      status: data.status || 'DRAFT',
      quotationDate,
      validityDays,
      expiryDate,
      subtotal,
      taxRate: toDecimal(18.0),
      taxAmount: totalTax,
      discountAmount: overallDiscount,
      totalAmount,
      terms: data.terms || 'Standard 30-day payment terms apply.',
      notes: data.notes,
      items,
    });

    await activityRepository.log({
      userId: actorId,
      customerId: data.customerId,
      entityType: 'QUOTATION',
      entityId: quotation.id,
      action: 'CREATED',
      description: `Drafted quotation ${quotation.quotationNumber} for amount ₹${totalAmount}`,
    });

    return quotation;
  }

  /**
   * Convert confirmed quotation into an active Subscription
   */
  async convertToSubscription(quotationId, actorId) {
    const quotation = await this.getQuotationById(quotationId);

    if (quotation.status === 'CONVERTED') {
      throw ApiError.badRequest('This quotation has already been converted into a subscription.');
    }

    if (quotation.status === 'CANCELLED' || quotation.status === 'EXPIRED') {
      throw ApiError.badRequest(`Cannot convert quotation with status '${quotation.status}'.`);
    }

    const startDate = new Date();
    const plan = quotation.plan;
    const nextBillingDate = calculateNextBillingDate(startDate, plan.frequency, plan.interval);
    const expiryDate = calculateNextBillingDate(startDate, 'YEARLY', 1); // 1-year contract default

    const subNumber = `SUB-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    // Prepare subscription line items from quotation items
    const subItems = quotation.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate,
      taxAmount: item.taxAmount,
      subtotal: item.subtotal,
    }));

    // Create Subscription
    const subscription = await subscriptionRepository.create({
      subscriptionNumber: subNumber,
      customerId: quotation.customerId,
      planId: quotation.planId,
      quotationId: quotation.id,
      status: 'ACTIVE',
      startDate,
      expiryDate,
      nextBillingDate,
      paymentTerms: 'NET_30',
      recurringAmount: quotation.totalAmount,
      autoRenew: true,
      items: subItems,
    });

    // Mark quotation as converted
    await quotationRepository.update(quotation.id, { status: 'CONVERTED' });

    await activityRepository.log({
      userId: actorId,
      customerId: quotation.customerId,
      entityType: 'QUOTATION',
      entityId: quotation.id,
      action: 'CONVERTED',
      description: `Converted quotation ${quotation.quotationNumber} to subscription ${subscription.subscriptionNumber}`,
    });

    return subscription;
  }
}

module.exports = new QuotationService();
