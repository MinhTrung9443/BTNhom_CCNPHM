import mongoose from "mongoose";

const orderLineSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: { type: String, required: true },
    productImage: { type: String },
    productPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

// Định nghĩa enum cho các trạng thái đơn hàng
const ORDER_STATUS = {
  NEW: "new", // 1. Đơn hàng mới
  CONFIRMED: "confirmed", // 2. Đã xác nhận
  PREPARING: "preparing", // 3. Shop đang chuẩn bị hàng
  SHIPPING: "shipping", // 4. Đang giao hàng
  DELIVERED: "delivered", // 5. Đã giao thành công
  CANCELLED: "cancelled", // 6. Hủy đơn hàng
  CANCELLATION_REQUESTED: "cancellation_requested", // Yêu cầu hủy đơn
};

// Schema cho timeline entry
const timelineEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    // Người thực hiện hành động (user, admin, system)
    performedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      userName: { type: String },
      userType: {
        type: String,
        enum: ["user", "admin", "system"],
        default: "system",
      },
    },
    // Thông tin bổ sung
    metadata: {
      reason: { type: String }, // Lý do hủy, ghi chú, v.v.
      location: { type: String }, // Vị trí giao hàng
      carrier: { type: String }, // Đơn vị vận chuyển
      trackingNumber: { type: String }, // Mã vận đơn
      estimatedDelivery: { type: Date }, // Thời gian giao hàng dự kiến
      actualDelivery: { type: Date }, // Thời gian giao hàng thực tế
    },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.NEW,
    },
    deliveryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Delivery",
    },
    orderLines: [orderLineSchema],
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    recipientName: { type: String, required: true },
    notes: { type: String },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    payment: {
      paymentMethod: {
        type: String,
        enum: ["VNPAY", "COD", "BANK"],
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
      },
      transactionId: { type: String },
    },

    voucher: { type: mongoose.Schema.Types.ObjectId, ref: "Voucher" },

    // Timestamps cho các trạng thái
    confirmedAt: { type: Date },
    preparingAt: { type: Date },
    shippingAt: { type: Date },
    deliveredAt: { type: Date },

    // Thông tin hủy đơn
    cancelledAt: { type: Date },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cancelledReason: { type: String },
    cancellationRequestedAt: { type: Date },
    cancellationRequestReason: { type: String },

    // Cờ đánh dấu đơn hàng có thể hủy (trong vòng 30 phút)
    canCancel: { type: Boolean, default: true },

    // Timeline theo dõi lịch sử thay đổi trạng thái
    timeline: [timelineEntrySchema],

    // Ghi chú nội bộ
    internalNotes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
export { ORDER_STATUS };
