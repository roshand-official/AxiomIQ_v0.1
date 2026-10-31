const discountRepository = require('../repositories/discount.repository');
const activityRepository = require('../repositories/activity.repository');
const ApiError = require('../utils/apiError');
const { toDecimal } = require('../utils/currency');

class DiscountService {
  async getAllDiscounts(filters) {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const { discounts, total } = await discountRepository.findMany({
      search: filters.search,
      isActive: filters.isActive !== undefined ? filters.isActive === 'true' : undefined,
      type: filters.type,
      skip,
      take: limit,
    });

    return { discounts, total, page, limit };
  }

  async getDiscountById(id) {
    const discount = await discountRepository.findById(id);
    if (!discount) throw ApiError.notFound('Discount rule not found');
    return discount;
  }

  async createDiscount(data, actorId) {
    const existing = await discountRepository.findByCode(data.code);
    if (existing) {
      throw ApiError.conflict(`A discount with code '${data.code}' already exists`);
    }

    const value = toDecimal(data.value);
    const minPurchase = toDecimal(data.minPurchase || 0);
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate <= startDate) {
      throw ApiError.badRequest('End date must be strictly after start date.');
    }

    const discount = await discountRepository.create({
      ...data,
      value,
      minPurchase,
      startDate,
      endDate,
    });

    await activityRepository.log({
      userId: actorId,
      entityType: 'DISCOUNT',
      entityId: discount.id,
      action: 'CREATED',
      description: `Created discount rule ${discount.code} (${discount.type} ${discount.value})`,
    });

    return discount;
  }

  /**
   * Validate and calculate applicable discount amount
   */
  async validateAndCalculate(code, purchaseAmount, quantity = 1, productId = null) {
    const discount = await discountRepository.findByCode(code);
    if (!discount || !discount.isActive) {
      throw ApiError.badRequest('Invalid or inactive discount code.');
    }

    const now = new Date();
    if (now < discount.startDate || now > discount.endDate) {
      throw ApiError.badRequest('This discount code has expired or is not yet active.');
    }

    if (discount.maxUsage && discount.currentUsage >= discount.maxUsage) {
      throw ApiError.badRequest('This discount code has reached its maximum usage limit.');
    }

    const amount = toDecimal(purchaseAmount);
    if (amount.lt(toDecimal(discount.minPurchase))) {
      throw ApiError.badRequest(`Minimum purchase of ₹${discount.minPurchase} required for this discount.`);
    }

    if (quantity < discount.minQuantity) {
      throw ApiError.badRequest(`Minimum quantity of ${discount.minQuantity} items required for this discount.`);
    }

    if (discount.scope === 'PRODUCT_SPECIFIC' && discount.productId && discount.productId !== productId) {
      throw ApiError.badRequest('This discount is not applicable to the selected product.');
    }

    let calculatedDiscount = toDecimal(0);
    if (discount.type === 'PERCENTAGE') {
      calculatedDiscount = amount.mul(toDecimal(discount.value)).div(100);
    } else {
      calculatedDiscount = toDecimal(discount.value);
    }

    return {
      discountId: discount.id,
      code: discount.code,
      type: discount.type,
      value: discount.value,
      calculatedDiscountAmount: calculatedDiscount,
    };
  }
}

module.exports = new DiscountService();
