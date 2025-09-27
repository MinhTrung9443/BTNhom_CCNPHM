import Notification from "../models/Notification.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

export const getNotifications = async (recipient, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;

    // Get total count and unread count
    const [total, unreadCount] = await Promise.all([
      Notification.countDocuments({ recipient }),
      Notification.countDocuments({ recipient, isRead: false }),
    ]);

    const notifications = await Notification.find({ recipient })
      .sort({ isRead: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const pagination = {
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
    };

    return {
      notifications,
      unreadCount,
      pagination,
    };
  } catch (error) {
    logger.error(`Error fetching notifications: ${error.message}`);
    throw new AppError("Không thể lấy danh sách thông báo", 500);
  }
};

export const markAsRead = async (notificationId, recipient) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient },
      { isRead: true },
      { new: true }
    ).lean();

    if (!notification) {
      throw new AppError("Thông báo không tồn tại", 404);
    }

    logger.info(`Notification ${notificationId} marked as read by admin`);
    return notification;
  } catch (error) {
    logger.error(`Error marking notification as read: ${error.message}`);
    throw new AppError("Không thể đánh dấu đã đọc", 500);
  }
};

export const markAllAsRead = async (recipient) => {
  try {
    const result = await Notification.updateMany(
      { recipient, isRead: false },
      { isRead: true }
    );

    logger.info(
      `Marked ${result.modifiedCount} notifications as read for ${recipient}`
    );
    return {
      success: true,
      modifiedCount: result.modifiedCount,
    };
  } catch (error) {
    logger.error(`Error marking all notifications as read: ${error.message}`);
    throw new AppError("Không thể đánh dấu tất cả đã đọc", 500);
  }
};

export const deleteNotification = async (notificationId, recipient) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient,
    }).lean();

    if (!notification) {
      throw new AppError("Thông báo không tồn tại", 404);
    }

    logger.info(`Notification ${notificationId} deleted by admin`);
    return notification;
  } catch (error) {
    logger.error(`Error deleting notification: ${error.message}`);
    throw new AppError("Không thể xóa thông báo", 500);
  }
};
