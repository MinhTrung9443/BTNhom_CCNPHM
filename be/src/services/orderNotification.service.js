import Notification from '../models/Notification.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { NotFoundError } from '../utils/AppError.js';
import logger from '../utils/logger.js';

/**
 * Tạo hoặc cập nhật thông báo cho đơn hàng
 * @param {Object} params - Tham số
 * @param {String} params.orderId - ID đơn hàng
 * @param {String} params.recipientUserId - ID người nhận thông báo
 * @param {String} params.title - Tiêu đề thông báo
 * @param {String} params.message - Nội dung thông báo
 * @param {String} params.actorId - ID người thực hiện (admin) - optional
 * @param {Object} params.metadata - Metadata bổ sung
 */
const createOrUpdateOrderNotification = async ({
  orderId,
  recipientUserId,
  title,
  message,
  actorId = null,
  metadata = {}
}) => {
  // Tìm thông báo hiện có cho đơn hàng này và người nhận này
  let notification = await Notification.findOne({
    type: 'order',
    subType: 'status_update',
    referenceId: orderId,
    recipientUserId
  });

  if (notification) {
    // Cập nhật thông báo hiện có
    // Thêm actor mới nếu có và chưa có trong danh sách
    if (actorId && !notification.actors.some(id => id.toString() === actorId.toString())) {
      notification.actors.push(actorId);
      notification.metadata.actorCount = notification.actors.length;
    }

    // Đánh dấu là chưa đọc
    notification.isRead = false;
    notification.updatedAt = new Date();

    // Cập nhật title và message
    notification.title = title;
    notification.message = message;
    
    // Cập nhật metadata
    notification.metadata = {
      ...notification.metadata,
      ...metadata,
      lastUpdateAt: new Date()
    };

    await notification.save();
    
    logger.info(`Updated existing order notification ${notification._id} for order ${orderId}`);
  } else {
    // Tạo thông báo mới
    notification = await Notification.create({
      title,
      message,
      type: 'order',
      subType: 'status_update',
      referenceId: orderId,
      recipient: 'user',
      recipientUserId,
      actors: actorId ? [actorId] : [],
      isRead: false,
      metadata: {
        ...metadata,
        actorCount: actorId ? 1 : 0,
        createdAt: new Date()
      }
    });

    logger.info(`Created new order notification ${notification._id} for order ${orderId}`);
  }

  // Populate thông tin actors nếu có
  if (notification.actors.length > 0) {
    await notification.populate('actors', 'name avatar');
  }

  // Emit real-time notification to user
  if (global.io && recipientUserId) {
    // Get unread count for user
    const unreadCount = await Notification.countDocuments({
      recipientUserId,
      isRead: false
    });

    const userSocketId = recipientUserId.toString();
    
    logger.info(`[OrderNotification] Emitting notification to user ${userSocketId}, unreadCount: ${unreadCount}`);
    
    global.io.to(userSocketId).emit('newNotification', {
      notification: notification.toObject(),
      unreadCount
    });
  }

  return notification;
};

/**
 * Xử lý thông báo khi admin cập nhật trạng thái đơn hàng
 * @param {String} orderId - ID đơn hàng
 * @param {String} adminId - ID admin thực hiện
 * @param {String} newStatus - Trạng thái mới
 * @param {String} title - Tiêu đề thông báo
 * @param {String} message - Nội dung thông báo
 */
const handleOrderStatusUpdate = async (orderId, adminId, newStatus, title, message) => {
  const order = await Order.findById(orderId)
    .select('userId orderCode totalAmount')
    .lean();

  if (!order) {
    throw new NotFoundError('Không tìm thấy đơn hàng');
  }

  // Tạo/cập nhật thông báo cho user
  return await createOrUpdateOrderNotification({
    orderId,
    recipientUserId: order.userId,
    title,
    message,
    actorId: adminId,
    metadata: {
      orderCode: order.orderCode,
      orderAmount: order.totalAmount,
      status: newStatus
    }
  });
};

/**
 * Tạo thông báo đơn hàng mới cho admin (không có aggregation vì admin cần thấy từng đơn riêng)
 * @param {String} orderId - ID đơn hàng
 * @param {String} title - Tiêu đề
 * @param {String} message - Nội dung
 * @param {Object} metadata - Metadata
 */
const createAdminOrderNotification = async (orderId, title, message, metadata = {}) => {
  const notification = await Notification.create({
    title,
    message,
    type: 'order',
    subType: 'new_order',
    referenceId: orderId,
    recipient: 'admin',
    isRead: false,
    metadata
  });

  logger.info(`Created admin notification ${notification._id} for order ${orderId}`);

  // Emit real-time notification to admin room
  if (global.io) {
    global.io.to('admin').emit('newNotification', {
      notification: notification.toObject()
    });
  }

  return notification;
};

export default {
  createOrUpdateOrderNotification,
  handleOrderStatusUpdate,
  createAdminOrderNotification
};
