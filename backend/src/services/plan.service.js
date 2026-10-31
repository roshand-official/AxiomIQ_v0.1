const planRepository = require('../repositories/plan.repository');
const activityRepository = require('../repositories/activity.repository');
const ApiError = require('../utils/apiError');
const { toDecimal } = require('../utils/currency');

class PlanService {
  async getAllPlans(filters) {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const { plans, total } = await planRepository.findMany({
      search: filters.search,
      frequency: filters.frequency,
      isActive: filters.isActive !== undefined ? filters.isActive === 'true' : undefined,
      skip,
      take: limit,
    });

    return { plans, total, page, limit };
  }

  async getPlanById(id) {
    const plan = await planRepository.findById(id);
    if (!plan) {
      throw ApiError.notFound(`Subscription plan with ID '${id}' not found`);
    }
    return plan;
  }

  async createPlan(data, actorId) {
    const code = data.code || `PLAN-${data.frequency.slice(0, 1)}-${Date.now().toString().slice(-4)}`;
    const basePrice = toDecimal(data.basePrice);

    const plan = await planRepository.create({
      ...data,
      code,
      basePrice,
      availableFrom: data.availableFrom ? new Date(data.availableFrom) : null,
      availableUntil: data.availableUntil ? new Date(data.availableUntil) : null,
    });

    await activityRepository.log({
      userId: actorId,
      entityType: 'PLAN',
      entityId: plan.id,
      action: 'CREATED',
      description: `Created subscription plan ${plan.name} (${plan.frequency})`,
    });

    return plan;
  }

  async updatePlan(id, data, actorId) {
    await this.getPlanById(id);

    const updateData = { ...data };
    if (data.basePrice) updateData.basePrice = toDecimal(data.basePrice);
    if (data.availableFrom) updateData.availableFrom = new Date(data.availableFrom);
    if (data.availableUntil) updateData.availableUntil = new Date(data.availableUntil);

    const updated = await planRepository.update(id, updateData);

    await activityRepository.log({
      userId: actorId,
      entityType: 'PLAN',
      entityId: id,
      action: 'UPDATED',
      description: `Updated subscription plan ${updated.name}`,
    });

    return updated;
  }
}

module.exports = new PlanService();
