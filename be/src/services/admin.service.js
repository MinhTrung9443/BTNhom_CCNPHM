import Order, { DETAILED_ORDER_STATUS, STATUS_MAP } from "../models/Order.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { createTimelineEntry, getTimestampField } from "./order.service.js";

// --- Reverse Status Map ---
const reverseStatusMap = {};
for (const generalStatus in STATUS_MAP) {
  for (const detailedStatus of STATUS_MAP[generalStatus]) {
    reverseStatusMap[detailedStatus] = generalStatus;
  }
}

// --- Admin-specific constants ---
const ADMIN_MANUAL_DETAILED_STATUSES = [
  DETAILED_ORDER_STATUS.PREPARING,
  DETAILED_ORDER_STATUS.SHIPPING_IN_PROGRESS,
  DETAILED_ORDER_STATUS.DELIVERED,
  DETAILED_ORDER_STATUS.CANCELLED,
  DETAILED_ORDER_STATUS.DELIVERY_FAILED,
  DETAILED_ORDER_STATUS.REFUNDED,
];

const DETAILED_STATUS_TRANSITION_MAP = {
  [DETAILED_ORDER_STATUS.NEW]: [DETAILED_ORDER_STATUS.CONFIRMED, DETAILED_ORDER_STATUS.CANCELLED],
  [DETAILED_ORDER_STATUS.CONFIRMED]: [DETAILED_ORDER_STATUS.PREPARING, DETAILED_ORDER_STATUS.CANCELLED],
  [DETAILED_ORDER_STATUS.PREPARING]: [DETAILED_ORDER_STATUS.SHIPPING_IN_PROGRESS, DETAILED_ORDER_STATUS.CANCELLED],
  [DETAILED_ORDER_STATUS.SHIPPING_IN_PROGRESS]: [DETAILED_ORDER_STATUS.DELIVERED, DETAILED_ORDER_STATUS.DELIVERY_FAILED, DETAILED_ORDER_STATUS.CANCELLED],
  [DETAILED_ORDER_STATUS.DELIVERED]: [DETAILED_ORDER_STATUS.COMPLETED, DETAILED_ORDER_STATUS.RETURN_REQUESTED],
  [DETAILED_ORDER_STATUS.DELIVERY_FAILED]: [],
  [DETAILED_ORDER_STATUS.CANCELLATION_REQUESTED]: [DETAILED_ORDER_STATUS.CANCELLED],
  [DETAILED_ORDER_STATUS.COMPLETED]: [],
  [DETAILED_ORDER_STATUS.CANCELLED]: [],
  [DETAILED_ORDER_STATUS.RETURN_REQUESTED]: [DETAILED_ORDER_STATUS.REFUNDED],
  [DETAILED_ORDER_STATUS.REFUNDED]: [],
};

const isValidDetailedTransition = (currentDetailedStatus, newDetailedStatus) => {
  return DETAILED_STATUS_TRANSITION_MAP[currentDetailedStatus]?.includes(newDetailedStatus) || false;
};

export const updateOrderStatusByAdmin = async (orderId, newDetailedStatus, metadata = {}) => {
  if (!ADMIN_MANUAL_DETAILED_STATUSES.includes(newDetailedStatus)) {
    throw new AppError(`Admin không thể tự cập nhật trạng thái thành '${newDetailedStatus}'.`, 403);
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError("Không tìm thấy đơn hàng.", 404);
  }

  const newGeneralStatus = reverseStatusMap[newDetailedStatus];
  if (!newGeneralStatus) {
      throw new AppError(`Không tìm thấy trạng thái tổng quan cho '${newDetailedStatus}'.`, 500);
  }

  const updateFields = {
    status: newGeneralStatus,
  };

  const timestampField = getTimestampField(newDetailedStatus);
  if (timestampField) {
    updateFields[timestampField] = new Date();
  }

  if (newDetailedStatus === DETAILED_ORDER_STATUS.CANCELLED) {
    updateFields.cancelAt= new Date();
    updateFields.cancelledBy = "admin";
    updateFields.cancelledReason = metadata.reason || "Bị hủy bởi quản trị viên";
  }

  const timelineEntry = createTimelineEntry(newDetailedStatus, "admin", metadata);

  updateFields.$push = { timeline: timelineEntry };

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    updateFields,
    { new: true, runValidators: true }
  ).lean();

  return updatedOrder;
};