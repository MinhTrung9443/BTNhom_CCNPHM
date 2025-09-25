import { productService } from "../services/product.service.js";
import { AppError } from "../utils/AppError.js";

export const productController = {
  async getLatestProducts(req, res, next) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const data = await productService.getLatestProducts(page, limit);
    res.status(200).json({ success: true, data });
  },

  async getBestSellerProducts(req, res, next) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const data = await productService.getBestSellerProducts(page, limit);
    res.status(200).json({ success: true, data });
  },

  async getMostViewedProducts(req, res, next) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const data = await productService.getMostViewedProducts(page, limit);
    res.status(200).json({ success: true, data });
  },

  async getTopDiscountProducts(req, res, next) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const data = await productService.getTopDiscountProducts(page, limit);
    res.status(200).json({ success: true, data });
  },

  async getAllProducts(req, res, next) {
    const data = await productService.getAllProducts(req.query);
    res.status(200).json({ success: true, data });
  },

  async getProductDetail(req, res, next) {
    const { id } = req.params;
    const userId = req.user?.id;
    const data = await productService.getProductDetail(id, userId);
    res.status(200).json({ success: true, data });
  },

  async getRelatedProducts(req, res, next) {
    const { id } = req.params;
    const data = await productService.getRelatedProducts(id);
    res.status(200).json({ success: true, data });
  },

  async recordProductView(req, res, next) {
    const { id: productId } = req.params;
    const userId = req.user.id;
    await productService.recordProductView(productId, userId);
    res.status(200).json({ message: 'Đã ghi nhận lượt xem' });
  },

  async getProductById(req, res, next) {
    const { id } = req.params;
    const data = await productService.getProductById(id);
    res.status(200).json(data);
  },

  async getProductsByIds(req, res, next) {
    const { ids } = req.body;
    const data = await productService.getProductsByIds(ids);
    res.status(200).json({ success: true, data });
  },
};