import User from "../models/User.js";
import LoyaltyPoints from "../models/LoyaltyPoints.js";
import { NotFoundError } from "../utils/AppError.js";

/**
 * Lấy số dư điểm tích lũy và điểm sắp hết hạn
 * @param {String} userId - ID người dùng
 * @returns {Object} { currentPoints, pointsExpiringThisMonth, expirationDate }
 */
export const getLoyaltyBalance = async (userId) => {
  const user = await User.findById(userId).select("loyaltyPoints").lean();
  
  if (!user) {
    throw new NotFoundError("Không tìm thấy người dùng");
  }

  // Tính ngày cuối tháng hiện tại
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Tìm các giao dịch tích điểm sẽ hết hạn trong tháng này (chưa hết hạn)
  const expiringTransactions = await LoyaltyPoints.find({
    userId,
    transactionType: "earned",
    expiryDate: { 
      $ne: null,
      $lte: endOfMonth, 
      $gte: now 
    }
  }).lean();

  const pointsExpiringThisMonth = expiringTransactions.reduce((sum, tx) => sum + tx.points, 0);

  return {
    currentPoints: user.loyaltyPoints || 0,
    pointsExpiringThisMonth,
    expirationDate: endOfMonth
  };
};

/**
 * Lấy lịch sử giao dịch điểm tích lũy
 * @param {String} userId - ID người dùng
 * @param {String} type - Loại giao dịch: "earn" | "redeem" | "all"
 * @param {Number} page - Trang hiện tại
 * @param {Number} limit - Số bản ghi mỗi trang
 * @returns {Object} { meta, data }
 */
export const getLoyaltyHistory = async (userId, type = "all", page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  // Build query filter
  const filter = { userId };
  if (type !== "all") {
    filter.transactionType = type;
  }

  const [transactions, totalRecords] = await Promise.all([
    LoyaltyPoints.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v")
      .lean(),
    LoyaltyPoints.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(totalRecords / limit);

  return {
    meta: {
      currentPage: page,
      totalPages,
      totalRecords,
      limit
    },
    data: transactions
  };
};

/**
 * Lấy danh sách giao dịch điểm tích lũy (có phân trang và lọc)
 * @param {String} userId - ID người dùng
 * @param {String} type - Loại giao dịch: "earned" | "expired" | "bonus" | "refund" | "all"
 * @param {Number} page - Trang hiện tại
 * @param {Number} limit - Số bản ghi mỗi trang
 * @returns {Object} { meta, data }
 */
export const getLoyaltyTransactions = async (userId, type = "all", page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  // Build query filter
  const filter = { userId };
  if (type !== "all") {
    filter.transactionType = type;
  }

  const [transactions, totalItems] = await Promise.all([
    LoyaltyPoints.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("orderId", "orderNumber totalAmount")
      .select("-__v")
      .lean(),
    LoyaltyPoints.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    meta: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit
    },
    data: transactions
  };
};

/**
 * Lấy thông tin điểm sắp hết hạn
 * Logic: Điểm nhận được sẽ hết hạn vào ngày cuối cùng của tháng kế tiếp
 * @param {String} userId - ID người dùng
 * @param {Number} days - Số ngày tới để kiểm tra (mặc định 30)
 * @returns {Object} { totalExpiringPoints, expiringWithinDays, details }
 */
export const getExpiringPoints = async (userId, days = 30) => {
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + days);

  // Tìm các giao dịch earned chưa hết hạn và sắp hết hạn trong khoảng thời gian
  const expiringTransactions = await LoyaltyPoints.find({
    userId,
    transactionType: "earned",
    expiryDate: {
      $ne: null,
      $gte: now,
      $lte: futureDate
    }
  })
    .sort({ expiryDate: 1 })
    .select("points expiryDate description createdAt")
    .lean();

  // Tính tổng điểm sắp hết hạn
  const totalExpiringPoints = expiringTransactions.reduce((sum, tx) => sum + tx.points, 0);

  // Format chi tiết từng nhóm điểm sắp hết hạn
  const details = expiringTransactions.map(tx => {
    const daysRemaining = Math.ceil((new Date(tx.expiryDate) - now) / (1000 * 60 * 60 * 24));
    return {
      points: tx.points,
      expiryDate: tx.expiryDate,
      daysRemaining,
      description: tx.description,
      earnedDate: tx.createdAt
    };
  });

  return {
    totalExpiringPoints,
    expiringWithinDays: days,
    details
  };
};
