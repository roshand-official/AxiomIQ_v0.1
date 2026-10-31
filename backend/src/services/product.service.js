const productRepository = require('../repositories/product.repository');
const activityRepository = require('../repositories/activity.repository');
const ApiError = require('../utils/apiError');
const { toDecimal } = require('../utils/currency');

class ProductService {
  async getAllProducts(filters) {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const { products, total } = await productRepository.findMany({
      search: filters.search,
      type: filters.type,
      isActive: filters.isActive !== undefined ? filters.isActive === 'true' : undefined,
      skip,
      take: limit,
    });

    return { products, total, page, limit };
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw ApiError.notFound(`Product with ID '${id}' not found`);
    }
    return product;
  }

  async createProduct(data, actorId) {
    const internalRef = data.internalRef || `PROD-${Date.now().toString().slice(-6)}`;
    const salesPrice = toDecimal(data.salesPrice);
    const costPrice = toDecimal(data.costPrice || 0);

    // If variants are supplied, compute their final salesPrice
    let variants = [];
    if (data.variants && Array.isArray(data.variants)) {
      variants = data.variants.map((v) => {
        const additionalPrice = toDecimal(v.additionalPrice || 0);
        return {
          name: v.name,
          attribute: v.attribute || 'Variant',
          additionalPrice,
          salesPrice: salesPrice.add(additionalPrice),
          isActive: v.isActive !== false,
        };
      });
    }

    const product = await productRepository.create({
      ...data,
      internalRef,
      salesPrice,
      costPrice,
      variants,
    });

    await activityRepository.log({
      userId: actorId,
      entityType: 'PRODUCT',
      entityId: product.id,
      action: 'CREATED',
      description: `Created product ${product.name} (${product.internalRef})`,
    });

    return product;
  }

  async updateProduct(id, data, actorId) {
    await this.getProductById(id);

    const updateData = { ...data };
    if (data.salesPrice) updateData.salesPrice = toDecimal(data.salesPrice);
    if (data.costPrice) updateData.costPrice = toDecimal(data.costPrice);

    const updated = await productRepository.update(id, updateData);

    await activityRepository.log({
      userId: actorId,
      entityType: 'PRODUCT',
      entityId: id,
      action: 'UPDATED',
      description: `Updated product ${updated.name}`,
    });

    return updated;
  }

  async addVariant(productId, variantData, actorId) {
    const product = await this.getProductById(productId);
    const additionalPrice = toDecimal(variantData.additionalPrice || 0);
    const salesPrice = toDecimal(product.salesPrice).add(additionalPrice);

    const variant = await productRepository.addVariant(productId, {
      name: variantData.name,
      attribute: variantData.attribute || 'Variant',
      additionalPrice,
      salesPrice,
    });

    await activityRepository.log({
      userId: actorId,
      entityType: 'PRODUCT',
      entityId: productId,
      action: 'VARIANT_ADDED',
      description: `Added variant ${variant.name} (+₹${additionalPrice}) to ${product.name}`,
    });

    return variant;
  }

  async deleteProduct(id, actorId) {
    await this.getProductById(id);
    const deactivated = await productRepository.delete(id);

    await activityRepository.log({
      userId: actorId,
      entityType: 'PRODUCT',
      entityId: id,
      action: 'ARCHIVED',
      description: `Archived product ${id}`,
    });

    return deactivated;
  }
}

module.exports = new ProductService();
