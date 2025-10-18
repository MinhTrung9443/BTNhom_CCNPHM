import { Product, Order, ProductView, Review, Favorite } from "../models/index.js";
import { AppError } from "../utils/AppError.js";

export const productService = {
  async getLatestProducts(page = 1, limit = 8) {
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments();
    const products = await Product.find()
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('name slug description price discount images categoryId createdAt stock');

    const totalPages = Math.ceil(total / limit);

    return {
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit
      }
    };
  },

  async getBestSellerProducts(page = 1, limit = 4) {
    const skip = (page - 1) * limit;

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
      .select('name slug description price discount images categoryId createdAt stock');

    const totalBestSellers = await Order.aggregate([
      { $match: { status: { $in: ["paid", "shipped", "completed"] } } },
      { $unwind: "$orderLines" },
      {
        $group: {
          _id: "$orderLines.productId",
        }
      },
      { $count: "total" }
    ]);

    const total = totalBestSellers[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const sortedProducts = bestSellers.map(seller => {
      const product = products.find(p => p._id.toString() === seller._id.toString());
      return product ? {
        ...product.toObject(),
        totalSold: seller.totalSold
      } : null;
    }).filter(Boolean);

    return {
      products: sortedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit
      }
    };
  },

  async getMostViewedProducts(page = 1, limit = 4) {
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
      .select('name slug description price discount images categoryId createdAt stock');

    const totalViewed = await ProductView.aggregate([
      {
        $group: {
          _id: "$productId",
        }
      },
      { $count: "total" }
    ]);

    const total = totalViewed[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const sortedProducts = mostViewed.map(viewed => {
      const product = products.find(p => p._id.toString() === viewed._id.toString());
      return product ? {
        ...product.toObject(),
        totalViews: viewed.totalViews
      } : null;
    }).filter(Boolean);

    return {
      products: sortedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit
      }
    };
  },

  async getTopDiscountProducts(page = 1, limit = 4) {
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments({ discount: { $gt: 0 } });
    const products = await Product.find({ discount: { $gt: 0 } })
      .populate('categoryId', 'name')
      .sort({ discount: -1 })
      .skip(skip)
      .limit(limit)
      .select('name slug description price discount images categoryId createdAt stock');

    const totalPages = Math.ceil(total / limit);

    return {
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit
      }
    };
  },

  async getAllProducts(queryParams) {
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 12;
    const skip = (page - 1) * limit;
    const { category, minPrice, maxPrice, search, sortBy } = queryParams;

    const filter = {};
    if (category) filter.categoryId = category;
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

    let sort = { createdAt: -1 };
    if (sortBy) {
      switch (sortBy) {
        case 'price_asc': sort = { price: 1 }; break;
        case 'price_desc': sort = { price: -1 }; break;
        case 'name_asc': sort = { name: 1 }; break;
        case 'name_desc': sort = { name: -1 }; break;
        case 'newest': sort = { createdAt: -1 }; break;
        case 'oldest': sort = { createdAt: 1 }; break;
      }
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('categoryId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('name slug description price discount images categoryId createdAt stock');

    const totalPages = Math.ceil(total / limit);

    return {
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }
    };
  },

  async getProductDetail(id, userId) {
    const productPromise = Product.findById(id)
      .populate('categoryId', 'name description');

    const successfulOrderStatuses = ['completed', 'shipped', 'delivered', 'paid'];
    const buyerCountPromise = Order.distinct('userId', {
      'orderLines.productId': id,
      'status': { $in: successfulOrderStatuses }
    }).countDocuments();

    const reviewerCountPromise = Review.distinct('userId', {
      'productId': id
    }).countDocuments();

    let isSavedPromise = Promise.resolve(false);
    if (userId) {
      isSavedPromise = Favorite.exists({ userId, productId: id }).then(fav => !!fav);
    }

    const [product, buyerCount, reviewerCount, isSaved] = await Promise.all([
      productPromise,
      buyerCountPromise,
      reviewerCountPromise,
      isSavedPromise
    ]);

    if (!product) {
      throw new AppError("Không tìm thấy sản phẩm", 404);
    }

    if (userId) {
      await ProductView.findOneAndUpdate(
        { userId, productId: id },
        { $inc: { viewCount: 1 }, lastViewedAt: new Date() },
        { upsert: true, new: true }
      );
    } else {
      await ProductView.findOneAndUpdate(
        { userId: null, productId: id },
        { $inc: { viewCount: 1 }, lastViewedAt: new Date() },
        { upsert: true, new: true }
      );
    }

    return {
      ...product.toObject(),
      buyerCount,
      reviewerCount,
      isSaved,
    };
  },

  async getProductDetailBySlug(slug, userId) {
    const productPromise = Product.findOne({ slug })
      .populate('categoryId', 'name description');

    const product = await productPromise;

    if (!product) {
      throw new AppError("Không tìm thấy sản phẩm", 404);
    }

    const id = product._id;
    const successfulOrderStatuses = ['completed', 'shipped', 'delivered', 'paid'];
    const buyerCountPromise = Order.distinct('userId', {
      'orderLines.productId': id,
      'status': { $in: successfulOrderStatuses }
    }).countDocuments();

    const reviewerCountPromise = Review.distinct('userId', {
      'productId': id
    }).countDocuments();

    let isSavedPromise = Promise.resolve(false);
    if (userId) {
      isSavedPromise = Favorite.exists({ userId, productId: id }).then(fav => !!fav);
    }
    console.log({ userId, id });

    const [buyerCount, reviewerCount, isSaved] = await Promise.all([
      buyerCountPromise,
      reviewerCountPromise,
      isSavedPromise
    ]);

    if (userId) {
      await ProductView.findOneAndUpdate(
        { userId, productId: id },
        { $inc: { viewCount: 1 }, lastViewedAt: new Date() },
        { upsert: true, new: true }
      );
    } else {
      await ProductView.findOneAndUpdate(
        { userId: null, productId: id },
        { $inc: { viewCount: 1 }, lastViewedAt: new Date() },
        { upsert: true, new: true }
      );
    }

    return {
      ...product.toObject(),
      buyerCount,
      reviewerCount,
      isSaved,
    };
  },

  async getRelatedProducts(id) {
    const currentProduct = await Product.findById(id).select('categoryId');
    if (!currentProduct) {
      throw new AppError("Không tìm thấy sản phẩm", 404);
    }

    return Product.find({
      categoryId: currentProduct.categoryId,
      _id: { $ne: id }
    })
      .limit(4)
      .populate('categoryId', 'name')
      .select('name slug price discount images categoryId stock');
  },

  async recordProductView(productId, userId) {
    await ProductView.findOneAndUpdate(
      { userId, productId },
      { $inc: { viewCount: 1 }, lastViewedAt: new Date() },
      { upsert: true, new: true }
    );
  },

  async getProductById(id) {
    const product = await Product.findById(id).populate('categoryId').populate('reviews');

    if (!product) {
      throw new AppError("Sản phẩm không tồn tại", 404);
    }
    const buyerCount = await Order.distinct('userId', {
      'items.productId': id,
      'status': 'completed'
    }).countDocuments();
    const reviewerCount = await Review.distinct('userId', {
      'productId': id
    }).countDocuments();

    return {
      ...product.toObject(),
      buyerCount,
      reviewerCount,
    };
  },

  async getProductsByIds(ids) {
    if (!Array.isArray(ids)) {
      throw new AppError("IDs must be an array", 400);
    }
    return Product.find({ '_id': { $in: ids } })
      .select('name slug price discount images stock');
  }
,
  async updateProduct(id, updateData) {
    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      throw new AppError("Không tìm thấy sản phẩm", 404);
    }
    return product;
  },

  async deleteProduct(productId) {
    // Check if the product is part of any order
    const orderCount = await Order.countDocuments({ 'orderLines.productId': productId });

    if (orderCount > 0) {
      // If the product is in an order, deactivate it (soft delete)
      const product = await Product.findByIdAndUpdate(productId, { isActive: false }, { new: true });
      if (!product) {
        throw new AppError("Không tìm thấy sản phẩm", 404);
      }
      return { message: 'Sản phẩm đã được vô hiệu hóa vì đã có trong đơn hàng.', product, softDeleted: true };
    } else {
      // If the product is not in any order, delete it permanently
      const product = await Product.findByIdAndDelete(productId);
      if (!product) {
        throw new AppError("Không tìm thấy sản phẩm", 404);
      }
      return { message: 'Sản phẩm đã được xóa vĩnh viễn.', productId, softDeleted: false };
    }
  },

  async createProduct(productData) {
    const exitsProduct = await Product.findOne({ name: productData.name });
    if (exitsProduct) {
      throw new AppError("Sản phẩm đã tồn tại", 400);
    }
    const product = new Product(productData);
    await product.save();
    return product;
  },

  async searchProducts({
    keyword = null,
    categoryId = null,
    minPrice = null,
    maxPrice = null,
    minRating = null,
    inStock = null,
    page = 1,
    limit = 12,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  }) {
    // Xây dựng filter object
    const filter = { isActive: true };

    // Text search - không phân biệt hoa thường
    if (keyword && keyword.trim()) {
      const searchRegex = new RegExp(keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex }
      ];
    }

    // Filter theo danh mục
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    // Filter theo khoảng giá
    if (minPrice !== null || maxPrice !== null) {
      filter.price = {};
      if (minPrice !== null) filter.price.$gte = minPrice;
      if (maxPrice !== null) filter.price.$lte = maxPrice;
    }

    // Filter theo đánh giá tối thiểu
    if (minRating !== null) {
      filter.averageRating = { $gte: minRating };
    }

    // Filter theo tình trạng còn hàng
    if (inStock === true) {
      filter.stock = { $gt: 0 };
    } else if (inStock === false) {
      filter.stock = 0;
    }

    // Xây dựng sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Nếu không sort theo createdAt, thêm createdAt làm sort thứ hai để đảm bảo consistent
    if (sortBy !== 'createdAt') {
      sort.createdAt = -1;
    }

    // Tính toán pagination
    const skip = (page - 1) * limit;

    // Thực hiện truy vấn song song
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('categoryId', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('name slug price discount images averageRating totalReviews soldCount stock categoryId createdAt')
        .lean(),
      Product.countDocuments(filter)
    ]);

    // Tính toán thông tin phân trang
    const totalPages = Math.ceil(total / limit);

    // Format dữ liệu trả về
    const formattedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      mainImage: product.images?.[0] || null,
      price: product.price,
      discount: product.discount,
      finalPrice: product.price * (1 - product.discount / 100),
      averageRating: product.averageRating || 0,
      totalReviews: product.totalReviews || 0,
      soldCount: product.soldCount || 0,
      stock: product.stock,
      category: product.categoryId,
      createdAt: product.createdAt
    }));

    const meta = {
      currentPage: page,
      totalPages,
      totalProducts: total,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      limit,
      filters: {
        keyword: keyword || null,
        categoryId: categoryId || null,
        priceRange: {
          min: minPrice,
          max: maxPrice
        },
        minRating: minRating || null,
        inStock
      },
      sort: {
        sortBy,
        sortOrder
      }
    };

    return {
      meta,
      data: formattedProducts
    };
  }
};