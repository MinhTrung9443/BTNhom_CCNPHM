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
export const getAllProductsForAdmin = async (queryParams) => {
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 10;
  const skip = (page - 1) * limit;
  const { search, category, sortBy, isActive } = queryParams;

  const filter = {};
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }
  if (category) {
    filter.categoryId = category;
  }
  if (isActive !== undefined && isActive !== '') {
    filter.isActive = isActive === 'true';
  }

  let sort = { createdAt: -1 };
  if (sortBy) {
    const [sortField, sortOrder] = sortBy.split(':');
    sort = { [sortField]: sortOrder === 'desc' ? -1 : 1 };
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('categoryId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    },
  };
};
export const getSalesChartData = async (period) => {
  let groupBy, fromDate;
  const now = new Date();

  switch (period) {
    case '7d':
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$deliveredAt" } };
      break;
    case '30d':
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
      groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$deliveredAt" } };
      break;
    case '1y':
      fromDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      groupBy = { year: { $year: "$deliveredAt" }, month: { $month: "$deliveredAt" } };
      break;
    default:
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$deliveredAt" } };
  }

  const salesData = await Order.aggregate([
    {
      $match: {
        status: ORDER_STATUS.COMPLETED,
        deliveredAt: { $gte: fromDate },
      },
    },
    {
      $group: {
        _id: groupBy,
        totalRevenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const labels = [];
  const data = [];

  if (period === '1y') {
    const monthData = {};
    salesData.forEach(item => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      monthData[key] = item.totalRevenue;
    });

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const key = `${year}-${String(month).padStart(2, '0')}`;
      labels.push(key);
      data.push(monthData[key] || 0);
    }
  } else {
    const dayData = {};
    salesData.forEach(item => {
      dayData[item._id] = item.totalRevenue;
    });
    const days = period === '7d' ? 7 : 30;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      labels.push(key);
      data.push(dayData[key] || 0);
    }
  }
  
  return {
    labels,
    datasets: [
      {
        label: 'Doanh thu',
        data,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };
};