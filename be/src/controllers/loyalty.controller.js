import * as loyaltyService from "../services/loyalty.service.js";

/**
 * @desc    Lấy số dư điểm tích lũy
 * @route   GET /api/loyalty/balance
 * @access  Private
 */
export const getLoyaltyBalance = async (req, res) => {
  const userId = req.user._id;
  const data = await loyaltyService.getLoyaltyBalance(userId);

  res.status(200).json({
    success: true,
    message: "Lấy thông tin điểm tích lũy thành công",
    data
  });
};

/**
 * @desc    Lấy lịch sử giao dịch điểm tích lũy
 * @route   GET /api/loyalty/history
 * @access  Private
 */
export const getLoyaltyHistory = async (req, res) => {
  const userId = req.user._id;
  const type = req.query.type || "all"; // "all" | "earned" | "redeemed" | "expired" | "refund"
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await loyaltyService.getLoyaltyHistory(userId, type, page, limit);

  res.status(200).json({
    success: true,
    message: "Lấy lịch sử điểm tích lũy thành công",
    meta: result.meta,
    data: result.data
  });
};

/**
 * @desc    Lấy danh sách giao dịch điểm tích lũy
 * @route   GET /api/users/loyalty-transactions
 * @access  Private
 */
export const getLoyaltyTransactions = async (req, res) => {
  const userId = req.user._id;
  const type = req.query.type || "all";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await loyaltyService.getLoyaltyTransactions(userId, type, page, limit);

  res.status(200).json({
    success: true,
    message: "Lấy danh sách giao dịch thành công",
    meta: result.meta,
    data: result.data
  });
};

/**
 * @desc    Lấy thông tin điểm sắp hết hạn
 * @route   GET /api/users/expiring-points
 * @access  Private
 */
export const getExpiringPoints = async (req, res) => {
  const userId = req.user._id;
  const data = await loyaltyService.getExpiringPoints(userId);

  res.status(200).json({
    success: true,
    message: "Lấy thông tin điểm sắp hết hạn thành công",
    data
  });
};
