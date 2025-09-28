import Order, { ORDER_STATUS } from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { AppError } from '../utils/AppError.js';

// Thống kê dòng tiền
export const getCashFlowStats = async () => {
  const cashFlowStats = await Order.aggregate([
    {
      $match: {
        status: { $in: [ORDER_STATUS.SHIPPING, ORDER_STATUS.COMPLETED] }
      }
    },
    {
      $group: {
        _id: "$status",
        totalAmount: { $sum: "$totalAmount" },
        count: { $sum: 1 }
      }
    }
  ]);

  const stats = {
    shipping: { totalAmount: 0, count: 0 },
    completed: { totalAmount: 0, count: 0 },
  };

  cashFlowStats.forEach(stat => {
    if (stats[stat._id]) {
      stats[stat._id].totalAmount = stat.totalAmount;
      stats[stat._id].count = stat.count;
    }
  });

  return stats;
};

// Lấy Top sản phẩm bán chạy
export const getTopSellingProducts = async (limit = 10) => {
  const topProducts = await Order.aggregate([
    { $match: { status: ORDER_STATUS.COMPLETED } },
    { $unwind: "$orderLines" },
    {
      $group: {
        _id: "$orderLines.productId",
        totalSold: { $sum: "$orderLines.quantity" }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: Product.collection.name,
        localField: "_id",
        foreignField: "_id",
        as: "productDetails"
      }
    },
    { $unwind: "$productDetails" },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        name: "$productDetails.name",
        image: { $arrayElemAt: ["$productDetails.images", 0] },
        totalSold: "$totalSold"
      }
    }
  ]);

  return topProducts;
};

// Lấy danh sách đơn hàng đã giao (có phân trang)
export const getDeliveredOrders = async ({ page = 1, limit = 5 }) => {
    const skip = (page - 1) * limit;
    const filter = { status: ORDER_STATUS.COMPLETED };

    const [orders, total] = await Promise.all([
        Order.find(filter)
            .sort({ deliveredAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userId', 'name')
            .lean(),
        Order.countDocuments(filter)
    ]);

    return {
        orders,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalOrders: total
        }
    };
};
// Lấy thống kê tổng quan cho Dashboard
export const getDashboardStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalUsers,
    newUsersToday,
    totalOrders,
    ordersToday,
    totalRevenueResult,
    revenueTodayResult,
    totalProducts,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: today } }),
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.aggregate([
      { $match: { status: ORDER_STATUS.COMPLETED } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.aggregate([
      { $match: { status: ORDER_STATUS.COMPLETED, deliveredAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Product.countDocuments({ isActive: true }),
  ]);

  return {
    totalUsers,
    newUsersToday,
    totalOrders,
    ordersToday,
    totalRevenue: totalRevenueResult[0]?.total || 0,
    revenueToday: revenueTodayResult[0]?.total || 0,
    totalProducts,
  };
};