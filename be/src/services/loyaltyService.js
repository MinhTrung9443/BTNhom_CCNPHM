import User from "../models/User.js";
import LoyaltyPoints from "../models/LoyaltyPoints.js";
import { NotFoundError, BadRequestError } from "../utils/AppError.js";

/**
 * Tính ngày hết hạn: ngày cuối cùng của tháng tiếp theo
 */
const calculateExpiryDate = () => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  nextMonth.setHours(23, 59, 59, 999);
  return nextMonth;
};

/**
 * Cộng điểm tích lũy khi đặt hàng
 * @param {String} userId - ID người dùng
 * @param {Number} orderAmount - Giá trị đơn hàng (trước khuyến mãi)
 * @param {String} orderId - ID đơn hàng
 * @param {String} orderNumber - Mã đơn hàng
 * @returns {Object} { earnedPoints, newBalance, expiresAt }
 */
export const addLoyaltyPoints = async (userId, orderAmount, orderId, orderNumber) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("Không tìm thấy người dùng");
  }

  // Tính điểm tích lũy: 1% giá trị đơn hàng
  const earnedPoints = Math.floor(orderAmount * 0.01);
  
  if (earnedPoints <= 0) {
    return { earnedPoints: 0, newBalance: user.loyaltyPoints, expiresAt: null };
  }

  const expiresAt = calculateExpiryDate();
  const newBalance = user.loyaltyPoints + earnedPoints;

  // Cập nhật số xu của user
  user.loyaltyPoints = newBalance;
  await user.save();

  // Tạo giao dịch
  await LoyaltyPoints.create({
    userId: userId,
    points: earnedPoints,
    transactionType: "earned",
    description: `Nhận điểm từ đơn hàng #${orderNumber}`,
    orderId: orderId,
    expiryDate: expiresAt
  });

  return { earnedPoints, newBalance, expiresAt };
};

/**
 * Lấy lịch sử giao dịch xu
 * @param {String} userId - ID người dùng
 * @param {Number} page - Trang hiện tại
 * @param {Number} limit - Số bản ghi mỗi trang
 * @returns {Object} { meta, data }
 */
export const getLoyaltyTransactions = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    LoyaltyPoints.find({ userId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v")
      .lean(),
    LoyaltyPoints.countDocuments({ userId: userId })
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    meta: {
      total,
      page,
      limit,
      totalPages
    },
    data: transactions
  };
};

/**
 * Kiểm tra xu sắp hết hạn
 * @param {String} userId - ID người dùng
 * @param {Number} days - Số ngày trước khi hết hạn (mặc định 7)
 * @returns {Object} { expiringPoints, expiryDate }
 */
export const getExpiringPoints = async (userId, days = 7) => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const expiringTransactions = await LoyaltyPoints.find({
    userId: userId,
    transactionType: "earned",
    expiryDate: { $lte: futureDate, $gte: now }
  }).lean();

  const expiringPoints = expiringTransactions.reduce((sum, tx) => sum + tx.points, 0);
  const earliestExpiry = expiringTransactions.length > 0
    ? expiringTransactions.reduce((earliest, tx) => 
        tx.expiryDate < earliest ? tx.expiryDate : earliest, 
        expiringTransactions[0].expiryDate
      )
    : null;

  return {
    expiringPoints,
    expiryDate: earliestExpiry
  };
};

