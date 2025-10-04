import * as viewHistoryService from "../services/viewHistory.service.js";
import logger from "../utils/logger.js";

// Thêm sản phẩm vào lịch sử xem
const addViewHistory = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const viewHistory = await viewHistoryService.addViewHistory(userId, productId);

    res.status(200).json({
      success: true,
      message: "Đã thêm vào lịch sử xem",
      data: viewHistory,
    });
  } catch (error) {
    logger.error("Error adding view history:", error);
    next(error);
  }
};

// Lấy lịch sử xem của user với phân trang
const getViewHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const result = await viewHistoryService.getViewHistory(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Error getting view history:", error);
    next(error);
  }
};

// Xóa một item khỏi lịch sử xem
const removeViewHistory = async (req, res, next) => {
  try {
    const { historyId } = req.params;
    const userId = req.user.id;

    await viewHistoryService.removeViewHistory(userId, historyId);

    res.status(200).json({
      success: true,
      message: "Đã xóa khỏi lịch sử xem",
    });
  } catch (error) {
    logger.error("Error removing view history:", error);
    next(error);
  }
};

// Xóa toàn bộ lịch sử xem
const clearViewHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await viewHistoryService.clearViewHistory(userId);

    res.status(200).json({
      success: true,
      message: "Đã xóa toàn bộ lịch sử xem",
    });
  } catch (error) {
    logger.error("Error clearing view history:", error);
    next(error);
  }
};

export { addViewHistory, getViewHistory, removeViewHistory, clearViewHistory };
