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

  // Tính ngày bắt đầu và kết thúc của tháng hiện tại
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Tìm các giao dịch tích điểm (earned, bonus) sẽ hết hạn trong tháng này.
  // Lưu ý: Cách tính này chưa trừ đi số điểm đã sử dụng (FIFO),
  // mà chỉ tính tổng các "khoản điểm" sẽ hết hạn.
  const expiringTransactions = await LoyaltyPoints.find({
    userId,
    transactionType: "earned",
    expiryDate: {
      $gte: startOfMonth,
      $lte: endOfMonth,
    },
  }).lean();

  const pointsExpiringThisMonth = expiringTransactions.reduce((sum, tx) => sum + tx.points, 0);

  return {
    currentPoints: user.loyaltyPoints || 0,
    pointsExpiringThisMonth,
    expirationDate: endOfMonth
  };
};

/**
 * Lấy lịch sử giao dịch điểm tích lũy (phiên bản mới, hợp nhất)
 * @param {String} userId - ID người dùng
 * @param {String} type - Loại giao dịch: "all" | "earned" | "redeemed" | "expired" | "refund"
 * @param {Number} page - Trang hiện tại
 * @param {Number} limit - Số bản ghi mỗi trang
 * @returns {Object} { meta, data }
 */
export const getLoyaltyHistory = async (userId, type = "all", page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  // Build query filter
  const filter = { userId };
  if (type !== "all") {
    if (type === "expired") {
      // Lọc các giao dịch đã hết hạn (expiryDate trong quá khứ)
      filter.expiryDate = { $lt: new Date() };
      // Chỉ quan tâm đến các loại giao dịch có thể hết hạn
      filter.transactionType = "earned";
    } else {
      // Các loại giao dịch khác
      const validTypes = ["earned", "refund", "redeemed"];
      if (validTypes.includes(type)) {
        filter.transactionType = type;
      }
    }
  }

  const [transactions, totalRecords] = await Promise.all([
    LoyaltyPoints.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("orderId", "orderNumber totalAmount")
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
/**
 * Lấy danh sách giao dịch điểm tích lũy cho admin (Sử dụng lại logic của getLoyaltyHistory)
 * @param {String} userId - ID người dùng
 * @param {String} type - Loại giao dịch: "all" | "earned" | "redeemed" | "expired" | "refund"
 * @param {Number} page - Trang hiện tại
 * @param {Number} limit - Số bản ghi mỗi trang
 * @returns {Object} { meta, data }
 */
export const getLoyaltyTransactions = async (userId, type = "all", page = 1, limit = 10) => {
  // Gọi lại hàm getLoyaltyHistory để đảm bảo logic nhất quán
  return getLoyaltyHistory(userId, type, page, limit);
};

/**
 * Lấy thông tin điểm sắp hết hạn
 * Logic: Điểm nhận được sẽ hết hạn vào ngày cuối cùng của tháng kế tiếp
 * @param {String} userId - ID người dùng
 * @param {Number} days - Số ngày tới để kiểm tra (mặc định 30)
 * @returns {Object} { totalExpiringPoints, expiringWithinDays, details }
 */
export const getExpiringPoints = async (userId) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Tìm các giao dịch earned/bonus sẽ hết hạn trong tháng này
  const expiringTransactions = await LoyaltyPoints.find({
    userId,
    transactionType: "earned",
    expiryDate: {
      $gte: startOfMonth,
      $lte: endOfMonth
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
    expirationDate: endOfMonth,
    details
  };
};
