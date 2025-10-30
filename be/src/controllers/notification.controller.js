import Notification from '../models/Notification.js';
import { BadRequestError } from '../utils/AppError.js';

/**
 * Lấy danh sách thông báo cho user hiện tại
 */
export const getNotifications = async (req, res) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Lấy thông báo của user
  const notifications = await Notification.find({ recipientUserId: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('actors', 'fullName avatar')
    .populate('articleId', 'title slug')
    .lean();

  // Đếm tổng số thông báo
  const total = await Notification.countDocuments({ recipientUserId: userId });

  // Đếm số thông báo chưa đọc
  const unreadCount = await Notification.countDocuments({
    recipientUserId: userId,
    isRead: false
  });

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    message: 'Lấy danh sách thông báo thành công',
    data: {
      notifications,
      unreadCount,
      pagination: {
        page,
        pages: totalPages,
        total,
        limit
      }
    }
  });
};

/**
 * Đánh dấu một thông báo là đã đọc
 */
export const markAsRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await Notification.findOne({
    _id: id,
    recipientUserId: userId
  });

  if (!notification) {
    throw new BadRequestError('Không tìm thấy thông báo');
  }

  notification.isRead = true;
  await notification.save();

  res.json({
    success: true,
    message: 'Đã đánh dấu thông báo là đã đọc',
    data: notification
  });
};

/**
 * Đánh dấu tất cả thông báo là đã đọc
 */
export const markAllAsRead = async (req, res) => {
  const userId = req.user._id;

  await Notification.updateMany(
    { recipientUserId: userId, isRead: false },
    { isRead: true }
  );

  res.json({
    success: true,
    message: 'Đã đánh dấu tất cả thông báo là đã đọc'
  });
};

/**
 * Xóa một thông báo
 */
export const deleteNotification = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await Notification.findOne({
    _id: id,
    recipientUserId: userId
  });

  if (!notification) {
    throw new BadRequestError('Không tìm thấy thông báo');
  }

  await notification.deleteOne();

  res.json({
    success: true,
    message: 'Đã xóa thông báo'
  });
};

/**
 * Lấy số lượng thông báo chưa đọc
 */
export const getUnreadCount = async (req, res) => {
  const userId = req.user._id;

  const unreadCount = await Notification.countDocuments({
    recipientUserId: userId,
    isRead: false
  });

  res.json({
    success: true,
    data: { unreadCount }
  });
};

// ===== ADMIN HANDLERS (Backward compatibility) =====

/**
 * Lấy danh sách thông báo cho admin (legacy handler)
 */
export const getNotificationsHandler = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Lấy thông báo của admin
  const notifications = await Notification.find({ recipient: 'admin' })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'fullName avatar email')
    .lean();

  // Đếm tổng số thông báo
  const total = await Notification.countDocuments({ recipient: 'admin' });

  // Đếm số thông báo chưa đọc
  const unreadCount = await Notification.countDocuments({
    recipient: 'admin',
    isRead: false
  });

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    message: 'Lấy danh sách thông báo thành công',
    data: {
      notifications,
      unreadCount,
      pagination: {
        page,
        pages: totalPages,
        total,
        limit
      }
    }
  });
};

/**
 * Đánh dấu một thông báo admin là đã đọc (legacy handler)
 */
export const markAsReadHandler = async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOne({
    _id: id,
    recipient: 'admin'
  });

  if (!notification) {
    throw new BadRequestError('Không tìm thấy thông báo');
  }

  notification.isRead = true;
  await notification.save();

  res.json({
    success: true,
    message: 'Đã đánh dấu thông báo là đã đọc',
    data: notification
  });
};

/**
 * Đánh dấu tất cả thông báo admin là đã đọc (legacy handler)
 */
export const markAllAsReadHandler = async (req, res) => {
  await Notification.updateMany(
    { recipient: 'admin', isRead: false },
    { isRead: true }
  );

  res.json({
    success: true,
    message: 'Đã đánh dấu tất cả thông báo là đã đọc'
  });
};

/**
 * Xóa một thông báo admin (legacy handler)
 */
export const deleteNotificationHandler = async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOne({
    _id: id,
    recipient: 'admin'
  });

  if (!notification) {
    throw new BadRequestError('Không tìm thấy thông báo');
  }

  await notification.deleteOne();

  res.json({
    success: true,
    message: 'Đã xóa thông báo'
  });
};
