import ViewHistory from "../models/ViewHistory.js";
import Product from "../models/Product.js";
import { AppError } from "../utils/AppError.js";

// Thêm sản phẩm vào lịch sử xem
const addViewHistory = async (userId, productId) => {
  // Kiểm tra sản phẩm có tồn tại không
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError("Sản phẩm không tồn tại", 404);
  }

  // Tạo record mới trong lịch sử xem
  const viewHistory = await ViewHistory.create({
    userId,
    productId,
    viewedAt: new Date(),
  });

  return await ViewHistory.findById(viewHistory._id).populate({
    path: "productId",
    select: "slug name price images discount",
  });
};

// Lấy lịch sử xem của user với phân trang
const getViewHistory = async (userId, options = {}) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  // Đếm tổng số records
  const total = await ViewHistory.countDocuments({ userId });

  // Lấy lịch sử xem với phân trang, sắp xếp theo thời gian mới nhất
  const viewHistory = await ViewHistory.find({ userId }).sort({ viewedAt: -1 }).skip(skip).limit(limit).populate({
    path: "productId",
    select: "slug name price images discount",
  });

  // Lọc ra những sản phẩm còn tồn tại
  const filteredHistory = viewHistory.filter((item) => item.productId);

  return {
    viewHistory: filteredHistory,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};

// Xóa một item khỏi lịch sử xem
const removeViewHistory = async (userId, historyId) => {
  const result = await ViewHistory.findOneAndDelete({
    _id: historyId,
    userId,
  });

  if (!result) {
    throw new AppError("Không tìm thấy lịch sử xem để xóa", 404);
  }

  return result;
};

// Xóa toàn bộ lịch sử xem của user
const clearViewHistory = async (userId) => {
  const result = await ViewHistory.deleteMany({ userId });
  return result;
};

// Lấy các sản phẩm được xem gần đây (không trùng lặp)
const getRecentlyViewedProducts = async (userId, limit = 10) => {
  const pipeline = [
    { $match: { userId: userId } },
    { $sort: { viewedAt: -1 } },
    {
      $group: {
        _id: "$productId",
        lastViewed: { $first: "$viewedAt" },
      },
    },
    { $sort: { lastViewed: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: "$product._id",
        slug: "$product.slug",
        name: "$product.name",
        price: "$product.price",
        images: "$product.images",
        discount: "$product.discount",
        lastViewed: 1,
      },
    },
  ];

  const recentlyViewed = await ViewHistory.aggregate(pipeline);
  return recentlyViewed;
};

export { addViewHistory, getViewHistory, removeViewHistory, clearViewHistory, getRecentlyViewedProducts };
