import Order, { ORDER_STATUS } from "../models/Order.js";
import logger from "../utils/logger.js";

// cron
export const updateOrderStatus = async (orderId, newStatus, updateData = {}, performedBy = null) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    // Kiểm tra tính hợp lệ của việc chuyển trạng thái
    if (!isValidStatusTransition(order.status, newStatus)) {
      throw new Error(`Không thể chuyển từ trạng thái ${order.status} sang ${newStatus}`);
    }

    const updateFields = {
      status: newStatus,
      ...updateData
    };

    // Cập nhật timestamp tương ứng
    const timestampField = getTimestampField(newStatus);
    if (timestampField) {
      updateFields[timestampField] = new Date();
    }

    // Cập nhật canCancel flag
    if (newStatus === ORDER_STATUS.PROCESSING) {
      updateFields.canCancel = false; // Không thể hủy trực tiếp khi shop đang chuẩn bị
    }

    // Tạo timeline entry
    const timelineEntry = createTimelineEntry(newStatus, performedBy, updateData);
    updateFields.$push = { timeline: timelineEntry };

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateFields,
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

    logger.info(`Đã cập nhật trạng thái đơn hàng ${orderId} từ ${order.status} sang ${newStatus}`);
    return updatedOrder;
  } catch (error) {
    logger.error(`Lỗi cập nhật trạng thái đơn hàng: ${error.message}`);
    throw error;
  }
};
// TODO: nếu là phương thức khác COD thì không auto confirm, thanh toán thành công thì tự chuyển sang confirmed
export const autoConfirmOrders = async () => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const ordersToConfirm = await Order.find({
      status: ORDER_STATUS.PENDING,
      createdAt: { $lte: thirtyMinutesAgo }
    });

    let confirmedCount = 0;
    for (const order of ordersToConfirm) {
      try {
        const performedBy = {
          userType: 'system',
          userName: 'System Auto-Confirm'
        };
        await updateOrderStatus(order._id, ORDER_STATUS.PROCESSING, {}, performedBy);
        confirmedCount++;
      } catch (error) {
        logger.error(`Lỗi auto-confirm đơn hàng ${order._id}: ${error.message}`);
      }
    }

    if (confirmedCount > 0) {
      logger.info(`Đã tự động xác nhận ${confirmedCount} đơn hàng`);
    }

    return confirmedCount;
  } catch (error) {
    logger.error(`Lỗi trong quá trình auto-confirm: ${error.message}`);
    throw error;
  }
};
/////////////////////////////
export const isValidStatusTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    [ORDER_STATUS.PENDING]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPING, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.SHIPPING]: [ORDER_STATUS.COMPLETED, ORDER_STATUS.RETURN_REFUND],
    [ORDER_STATUS.COMPLETED]: [],
    [ORDER_STATUS.CANCELLED]: [],
    [ORDER_STATUS.RETURN_REFUND]: [],
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

export const getTimestampField = (status) => {
  const timestampMap = {
    [ORDER_STATUS.PROCESSING]: 'confirmedAt',
    [ORDER_STATUS.SHIPPING]: 'shippingAt',
    [ORDER_STATUS.CANCELLED]: 'cancelledAt',
  };

  return timestampMap[status];
};
//////////////////////////////////////////////////////


export const getUserOrders = async (userId, page = 1, limit = 10, status = null, search = null) => {
  try {
    const filter = { userId };
    if (status) {
      filter.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { 'orderLines.productName': searchRegex },
        { recipientName: searchRegex },
        { phoneNumber: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;
    
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    return {
      orders,
      pagination: {
        current: page,
        limit,
        total: Math.ceil(total / limit),
        totalOrders: total
      }
    };
  } catch (error) {
    logger.error(`Lỗi lấy danh sách đơn hàng: ${error.message}`);
    throw error;
  }
};

export const getOrderDetail = async (orderId, userId = null) => {
  try {
    const filter = { _id: orderId };
    if (userId) {
      filter.userId = userId;
    }

    const order = await Order.findOne(filter)
      .populate('userId', 'name email phone')
      .populate('deliveryId', 'name price description') // Populate with specific fields
      .lean(); // Use lean for faster queries

    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    return order;
  } catch (error) {
    logger.error(`Lỗi lấy chi tiết đơn hàng: ${error.message}`);
    throw error;
  }
};

export const getOrderStats = async (userId = null) => {
  try {
    const filter = userId ? { userId } : {};
    
    const stats = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        }
      }
    ]);

    const result = {};
    for (const status of Object.values(ORDER_STATUS)) {
      result[status] = {
        count: 0,
      };
    }

    stats.forEach(stat => {
      result[stat._id] = {
        count: stat.count,
      };
    });

    return result;
  } catch (error) {
    logger.error(`Lỗi lấy thống kê đơn hàng: ${error.message}`);
    throw error;
  }
};

export const createTimelineEntry = (status, performedBy = null, metadata = {}) => {
  const statusDescriptions = {
    [ORDER_STATUS.PENDING]: 'Đơn hàng đang chờ xác nhận',
    [ORDER_STATUS.PROCESSING]: 'Đơn hàng đã được xác nhận và đang được chuẩn bị',
    [ORDER_STATUS.SHIPPING]: 'Đơn hàng đang được giao',
    [ORDER_STATUS.COMPLETED]: 'Đơn hàng đã hoàn thành',
    [ORDER_STATUS.CANCELLED]: 'Đơn hàng đã bị hủy',
    [ORDER_STATUS.RETURN_REFUND]: 'Đơn hàng bị trả lại hoặc yêu cầu hoàn tiền',
  };

  const entry = {
    status,
    timestamp: new Date(),
    description: statusDescriptions[status] || 'Cập nhật trạng thái đơn hàng',
    performedBy: performedBy || {
      userType: 'system',
      userName: 'System'
    },
    metadata: {
      ...metadata
    }
  };

  // Thêm thông tin bổ sung cho từng trạng thái
  if (status === ORDER_STATUS.CANCELLED && metadata.cancelledReason) {
    entry.description += ` - Lý do: ${metadata.cancelledReason}`;
    entry.metadata.reason = metadata.cancelledReason;
  }

  if (status === ORDER_STATUS.SHIPPING) {
    entry.description = 'Đơn hàng đang được giao đến bạn';
    if (metadata.trackingNumber) {
      entry.description += ` - Mã vận đơn: ${metadata.trackingNumber}`;
      entry.metadata.trackingNumber = metadata.trackingNumber;
    }
    if (metadata.carrier) {
      entry.description += ` - Đơn vị vận chuyển: ${metadata.carrier}`;
      entry.metadata.carrier = metadata.carrier;
    }
    if (metadata.estimatedDelivery) {
      entry.metadata.estimatedDelivery = metadata.estimatedDelivery;
    }
  }

  return entry;
};

