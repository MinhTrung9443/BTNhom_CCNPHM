import * as userService from '../services/user.service.js';
import { loyaltyPointsService } from '../services/loyaltyPoints.service.js';
import logger from '../utils/logger.js';

const getMe = (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            user: req.user,
        },
    });
};
 
const updateMe = async (req, res, next) => {
    const updatedUser = await userService.updateUserProfile(req.user.id, req.body, req.file);
    res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin thành công.',
        data: {
            user: updatedUser,
        },
    });
};

const toggleFavorite = async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user.id;
  const result = await userService.toggleFavorite(userId, productId);
  const message = result.favorited ? 'Đã thêm vào danh sách yêu thích' : 'Đã xóa khỏi danh sách yêu thích';
  res.status(200).json({ message, favorited: result.favorited });
};

const getFavorites = async (req, res, next) => {
  const userId = req.user.id;
  const favorites = await userService.getFavorites(userId);
  res.status(200).json({ favorites });
};

const getRecentlyViewed = async (req, res, next) => {
    const userId = req.user.id;
    const recentlyViewed = await userService.getRecentlyViewed(userId);
    res.status(200).json({ recentlyViewed });
};

// === LOYALTY POINTS FUNCTIONALITY ===

const getUserLoyaltyPoints = async (req, res, next) => {
  const userId = req.user.id;

  const availablePoints = await loyaltyPointsService.getUserAvailablePoints(userId);
  const redemptionOptions = loyaltyPointsService.getRedemptionOptions(availablePoints);

  res.json({
    success: true,
    message: 'Lấy thông tin điểm thành công',
    data: {
      availablePoints,
      redemptionOptions
    }
  });
};

const redeemPoints = async (req, res, next) => {
  const userId = req.user.id;
  const { pointsToRedeem, discountValue } = req.body;

  if (!pointsToRedeem || !discountValue) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
  }

  const transaction = await loyaltyPointsService.redeemPointsForDiscount(
    userId,
    pointsToRedeem,
    discountValue
  );

  const availablePoints = await loyaltyPointsService.getUserAvailablePoints(userId);

  res.json({
    success: true,
    message: `Đã đổi ${pointsToRedeem} điểm thành ${discountValue.toLocaleString('vi-VN')} VNĐ`,
    data: {
      transaction,
      availablePoints
    }
  });
};

const getPointsHistory = async (req, res, next) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;

  const history = await loyaltyPointsService.getUserPointsHistory(
    userId,
    parseInt(page),
    parseInt(limit)
  );

  res.json({
    success: true,
    message: 'Lấy lịch sử điểm thành công',
    data: history
  });
};

export { getMe, updateMe, getFavorites, toggleFavorite, getRecentlyViewed, getUserLoyaltyPoints, redeemPoints, getPointsHistory };
