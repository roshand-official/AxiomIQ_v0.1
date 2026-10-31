const productService = require('../services/product.service');
const ApiResponse = require('../utils/apiResponse');

class ProductController {
  async getAll(req, res, next) {
    try {
      const { products, total, page, limit } = await productService.getAllProducts(req.query);
      return ApiResponse.paginated(res, products, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      return ApiResponse.success(res, product);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const product = await productService.createProduct(req.body, req.user?.id);
      return ApiResponse.created(res, product, 'Product created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await productService.updateProduct(req.params.id, req.body, req.user?.id);
      return ApiResponse.success(res, updated, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async addVariant(req, res, next) {
    try {
      const variant = await productService.addVariant(req.params.id, req.body, req.user?.id);
      return ApiResponse.created(res, variant, 'Variant added successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await productService.deleteProduct(req.params.id, req.user?.id);
      return ApiResponse.success(res, null, 'Product archived successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
