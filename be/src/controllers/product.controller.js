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
    const userId = req.user?._id; // Lấy userId nếu user đã đăng nhập
    const data = await productService.getProductDetail(id, userId);
    res.status(200).json({ success: true, data });
  },

  async getProductBySlug(req, res, next) {
    console.log("goi lan")
    const { slug } = req.params;
    const userId = req.user?._id; // Lấy userId nếu user đã đăng nhập
    console.log({ slug, userId })
    const data = await productService.getProductDetailBySlug(slug, userId);
    res.status(200).json({ success: true, data });
  },

  async getRelatedProducts(req, res, next) {
    const { id } = req.params;
    const data = await productService.getRelatedProducts(id);
    res.status(200).json({ success: true, data });
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

  async createProduct(req, res, next) {
    try {
      const productData = { ...req.body };
      if (req.files) {
        productData.images = req.files.map(file => file.path);
      }
      const data = await productService.createProduct(productData);
      res.status(201).json({ success: true, message: "Tạo sản phẩm thành công", data });
    } catch (error) {
      next(error);
    }
  },

  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const productData = { ...req.body };

      // Ensure `images` from the body is an array
      let finalImages = [];
      if (productData.images) {
        finalImages = Array.isArray(productData.images) ? productData.images : [productData.images];
      }

      // Add newly uploaded image URLs
      if (req.files && req.files.length > 0) {
        const newImageUrls = req.files.map(file => file.path);
        finalImages.push(...newImageUrls);
      }

      productData.images = finalImages;
      const data = await productService.updateProduct(id, productData);
      res.status(200).json({ success: true, message: "Cập nhật sản phẩm thành công", data });
    } catch (error) {
      next(error);
    }
  },

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const result = await productService.deleteProduct(id);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async searchProducts(req, res, next) {
    const {
      keyword,
      categoryId,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      page,
      limit,
      sortBy,
      sortOrder
    } = req.query;

    const result = await productService.searchProducts({
      keyword,
      categoryId,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      minRating: minRating ? parseFloat(minRating) : null,
      inStock: inStock !== undefined ? inStock === 'true' : null,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 12,
      sortBy,
      sortOrder
    });

    res.status(200).json({
      success: true,
      message: "Tìm kiếm sản phẩm thành công",
      meta: result.meta,
      data: result.data
    });
  }
};