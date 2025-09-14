import { Product, Order, ProductView } from "../models/index.js";
import { AppError } from "../utils/AppError.js";

export const productController = {
  // API lấy sản phẩm mới nhất với phân trang
  async getLatestProducts(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 8;
      const skip = (page - 1) * limit;

      const total = await Product.countDocuments();
      const products = await Product.find()
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('name description price discount images categoryId createdAt stock');

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: {
          products,
          pagination: {
            currentPage: page,
            totalPages,
            totalProducts: total,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            limit
          }
        }
      });
    } catch (error) {
      next(new AppError("Lỗi khi lấy sản phẩm mới nhất", 500));
    }
  },

  // API lấy sản phẩm bán chạy với phân trang
  async getBestSellerProducts(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 4;
      const skip = (page - 1) * limit;

      // Tính toán số lượng bán của từng sản phẩm
      const bestSellers = await Order.aggregate([
        { $match: { status: { $in: ["paid", "shipped", "completed"] } } },
        { $unwind: "$orderLines" },
        {
          $group: {
            _id: "$orderLines.productId",
            totalSold: { $sum: "$orderLines.quantity" }
          }
        },
        { $sort: { totalSold: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]);

      const productIds = bestSellers.map(item => item._id);
      const products = await Product.find({ _id: { $in: productIds } })
        .populate('categoryId', 'name')
        .select('name description price discount images categoryId createdAt stock');

      // Đếm tổng số sản phẩm bán chạy
      const totalBestSellers = await Order.aggregate([
        { $match: { status: { $in: ["paid", "shipped", "completed"] } } },
        { $unwind: "$orderLines" },
        {
          $group: {
            _id: "$orderLines.productId",
            totalSold: { $sum: "$orderLines.quantity" }
          }
        },
        { $count: "total" }
      ]);

      const total = totalBestSellers[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      // Sắp xếp lại theo thứ tự bán chạy
      const sortedProducts = bestSellers.map(seller => {
        const product = products.find(p => p._id.toString() === seller._id.toString());
        return product ? {
          ...product.toObject(),
          totalSold: seller.totalSold
        } : null;
      }).filter(Boolean);

      res.status(200).json({
        success: true,
        data: {
          products: sortedProducts,
          pagination: {
            currentPage: page,
            totalPages,
            totalProducts: total,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            limit
          }
        }
      });
    } catch (error) {
      next(new AppError("Lỗi khi lấy sản phẩm bán chạy", 500));
    }
  },

  // API lấy sản phẩm được xem nhiều với phân trang
  async getMostViewedProducts(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 4;
      const skip = (page - 1) * limit;

      const mostViewed = await ProductView.aggregate([
        {
          $group: {
            _id: "$productId",
            totalViews: { $sum: "$viewCount" }
          }
        },
        { $sort: { totalViews: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]);

      const productIds = mostViewed.map(item => item._id);
      const products = await Product.find({ _id: { $in: productIds } })
        .populate('categoryId', 'name')
        .select('name description price discount images categoryId createdAt stock');

      // Đếm tổng số sản phẩm được xem
      const totalViewed = await ProductView.aggregate([
        {
          $group: {
            _id: "$productId",
            totalViews: { $sum: "$viewCount" }
          }
        },
        { $count: "total" }
      ]);

      const total = totalViewed[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      // Sắp xếp lại theo thứ tự lượt xem
      const sortedProducts = mostViewed.map(viewed => {
        const product = products.find(p => p._id.toString() === viewed._id.toString());
        return product ? {
          ...product.toObject(),
          totalViews: viewed.totalViews
        } : null;
      }).filter(Boolean);

      res.status(200).json({
        success: true,
        data: {
          products: sortedProducts,
          pagination: {
            currentPage: page,
            totalPages,
            totalProducts: total,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            limit
          }
        }
      });
    } catch (error) {
      next(new AppError("Lỗi khi lấy sản phẩm được xem nhiều", 500));
    }
  },

  // API lấy sản phẩm khuyến mãi với phân trang
  async getTopDiscountProducts(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 4;
      const skip = (page - 1) * limit;

      const total = await Product.countDocuments({ discount: { $gt: 0 } });
      const products = await Product.find({ discount: { $gt: 0 } })
        .populate('categoryId', 'name')
        .sort({ discount: -1 })
        .skip(skip)
        .limit(limit)
        .select('name description price discount images categoryId createdAt stock');

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: {
          products,
          pagination: {
            currentPage: page,
            totalPages,
            totalProducts: total,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            limit
          }
        }
      });
    } catch (error) {
      next(new AppError("Lỗi khi lấy sản phẩm khuyến mãi", 500));
    }
  },

  // API lấy tất cả sản phẩm với phân trang
  async getAllProducts(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;
      
      const { category, minPrice, maxPrice, search, sortBy } = req.query;

      // Build filter object
      const filter = {};
      
      if (category) {
        filter.categoryId = category;
      }
      
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
      }
      
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort object
      let sort = { createdAt: -1 }; // default sort
      if (sortBy) {
        switch (sortBy) {
          case 'price_asc':
            sort = { price: 1 };
            break;
          case 'price_desc':
            sort = { price: -1 };
            break;
          case 'name_asc':
            sort = { name: 1 };
            break;
          case 'name_desc':
            sort = { name: -1 };
            break;
          case 'newest':
            sort = { createdAt: -1 };
            break;
          case 'oldest':
            sort = { createdAt: 1 };
            break;
        }
      }

      const total = await Product.countDocuments(filter);
      const products = await Product.find(filter)
        .populate('categoryId', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('name description price discount images categoryId createdAt stock');

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: {
          products,
          pagination: {
            currentPage: page,
            totalPages,
            totalProducts: total,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });
    } catch (error) {
      next(new AppError("Lỗi khi lấy danh sách sản phẩm", 500));
    }
  },

  // API lấy chi tiết sản phẩm và cập nhật lượt xem
  async getProductDetail(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id; // từ middleware auth (nếu user đã đăng nhập)

      const product = await Product.findById(id)
        .populate('categoryId', 'name description');

      if (!product) {
        return next(new AppError("Không tìm thấy sản phẩm", 404));
      }

      // Cập nhật lượt xem
      if (userId) {
        // User đã đăng nhập
        await ProductView.findOneAndUpdate(
          { userId, productId: id },
          { 
            $inc: { viewCount: 1 },
            lastViewedAt: new Date()
          },
          { upsert: true, new: true }
        );
      } else {
        // User chưa đăng nhập (guest)
        await ProductView.findOneAndUpdate(
          { userId: null, productId: id },
          { 
            $inc: { viewCount: 1 },
            lastViewedAt: new Date()
          },
          { upsert: true, new: true }
        );
      }

      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      next(new AppError("Lỗi khi lấy chi tiết sản phẩm", 500));
    }
  },

  // API lấy sản phẩm liên quan
  async getRelatedProducts(req, res, next) {
    try {
      const { id } = req.params;

      // 1. Tìm sản phẩm hiện tại để lấy categoryId
      const currentProduct = await Product.findById(id).select('categoryId');
      if (!currentProduct) {
        return next(new AppError("Không tìm thấy sản phẩm", 404));
      }

      // 2. Tìm các sản phẩm liên quan
      const relatedProducts = await Product.find({
        categoryId: currentProduct.categoryId, // Cùng danh mục
        _id: { $ne: id }                       // Loại trừ chính sản phẩm hiện tại
      })
      .limit(4) // Giới hạn 4 sản phẩm
      .populate('categoryId', 'name')
      .select('name price discount images categoryId stock');

      res.status(200).json({
        success: true,
        data: relatedProducts,
      });
    } catch (error) {
      next(new AppError("Lỗi khi lấy sản phẩm liên quan", 500));
    }
  }
};