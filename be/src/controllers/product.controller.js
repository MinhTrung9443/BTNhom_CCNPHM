import { Product, Order, ProductView } from "../models/index.js";
import { AppError } from "../utils/AppError.js";

export const productController = {
  // API lấy 8 sản phẩm mới nhất
  async getLatestProducts(req, res, next) {
    try {
      const products = await Product.find()
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 })
        .limit(8)
        .select('name description price discount images categoryId createdAt');

      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      next(new AppError("Lỗi khi lấy sản phẩm mới nhất", 500));
    }
  },

  // API lấy 6 sản phẩm bán chạy nhất
  async getBestSellerProducts(req, res, next) {
    try {
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
        { $limit: 6 }
      ]);

      const productIds = bestSellers.map(item => item._id);
      const products = await Product.find({ _id: { $in: productIds } })
        .populate('categoryId', 'name')
        .select('name description price discount images categoryId createdAt');

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
        data: sortedProducts
      });
    } catch (error) {
      next(new AppError("Lỗi khi lấy sản phẩm bán chạy", 500));
    }
  },

  // API lấy 8 sản phẩm được xem nhiều nhất
  async getMostViewedProducts(req, res, next) {
    try {
      const mostViewed = await ProductView.aggregate([
        {
          $group: {
            _id: "$productId",
            totalViews: { $sum: "$viewCount" }
          }
        },
        { $sort: { totalViews: -1 } },
        { $limit: 8 }
      ]);

      const productIds = mostViewed.map(item => item._id);
      const products = await Product.find({ _id: { $in: productIds } })
        .populate('categoryId', 'name')
        .select('name description price discount images categoryId createdAt');

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
        data: sortedProducts
      });
    } catch (error) {
      next(new AppError("Lỗi khi lấy sản phẩm được xem nhiều nhất", 500));
    }
  },

  // API lấy 4 sản phẩm khuyến mãi cao nhất
  async getTopDiscountProducts(req, res, next) {
    try {
      const products = await Product.find({ discount: { $gt: 0 } })
        .populate('categoryId', 'name')
        .sort({ discount: -1 })
        .limit(4)
        .select('name description price discount images categoryId createdAt');

      res.status(200).json({
        success: true,
        data: products
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
      let sort = { createdAt: -1 }; // mặc định sắp xếp theo ngày tạo
      
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
          case 'discount_desc':
            sort = { discount: -1 };
            break;
        }
      }

      const [products, total] = await Promise.all([
        Product.find(filter)
          .populate('categoryId', 'name')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .select('name description price discount images categoryId createdAt'),
        Product.countDocuments(filter)
      ]);

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
  }
};