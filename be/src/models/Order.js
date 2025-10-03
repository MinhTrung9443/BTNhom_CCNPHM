import mongoose from "mongoose";

const orderLineSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productCode: { type: String, required: true },
    productName: { type: String, required: true },
    productImage: { type: String },
    productPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    discount: { type: Number, required: true, default: 0 },
    productActualPrice: { type: Number, required: true },
    lineTotal: { type: Number, required: true }, // productActualPrice * quantity
  },
  { _id: false }
);

// Định nghĩa các trạng thái đơn hàng để quản lý vòng đời và phân loại trên UI
const ORDER_STATUS = {
  PENDING: "pending", // Chờ xác nhận -> Tab: Chờ xác nhận
  PROCESSING: "processing", // Đã xác nhận, đang chuẩn bị, yêu cầu hủy -> Tab: Vận chuyển
  SHIPPING: "shipping", // Đang giao hàng, Đã giao  -> Tab: Chờ giao hàng
  COMPLETED: "completed", // Hoàn thành (khi khách bấm nhận hàng) -> Tab: Đã giao hàng
  CANCELLED: "cancelled", // chưa thanh toán, Đã hủy (Trước khi giao hàng) -> Tab: Đã hủy
  RETURN_REFUND: "return_refund", // Giao hàng không thành công, Trả hàng/Hoàn tiền (Sau khi giao hàng) -> Tab: Trả hàng/Hoàn tiền
};

//  chỉ hủy được khi đơn hàng đăng ở trạng thái status là PENDING hoặc PROCESSING,  và nếu là PROCESSING thì kiểm tra thêm trạng thái chi tiết mới nhất (trong DETAILED_ORDER_STATUS, nếu là đang SHIPPING_IN_PROGRESS thì lúc này sẽ thành yêu cầu hủy cancellation_requested  để đợi admin xác nhận hoặc từ chối) nếu đã có trạng thái SHIPPING.COMPLETED thì lúc này chỉ được yêu cầu trả hàng, hoàn tiền,
const DETAILED_ORDER_STATUS = {
  // PENDING
  NEW: "new", // Đơn hàng đã được đặt (tự động bởi hệ thống)

  // PROCESSING
  CONFIRMED: "confirmed", // Đơn hàng đã xác nhận (tự động bởi hệ thống)
  PREPARING: "preparing", // Người bán đang chuẩn bị hàng (thủ công bởi admin)
 
  // SHIPPING
  SHIPPING_IN_PROGRESS: "shipping_in_progress", // Đang giao hàng (thủ công bởi admin)
  DELIVERED: "delivered", // Đã giao hàng (thủ công bởi admin)
  CANCELLATION_REQUESTED: "cancellation_requested", // Yêu cầu hủy (thủ công bởi user)

  // COMPLETED
  COMPLETED: "completed", // Hoàn thành (khách đã nhận hàng) (thủ công bởi user)

  // CANCELLED
  PAYMENT_OVERDUE: "payment_overdue", // Quá hạn thanh toán (tự động cập nhật bởi hệ thống)
  CANCELLED: "cancelled", // Đã hủy (trước khi shop chuẩn bị) (thủ công bởi admin hoặc user)

  // RETURN_REFUND
  DELIVERY_FAILED: "delivery_failed", // Giao hàng không thành công (thủ công bởi admin)
  RETURN_REQUESTED: "return_requested", // Yêu cầu trả hàng/hoàn tiền (thủ công bởi user)
  REFUNDED: "refunded", // Đã hoàn tiền (thủ công bởi admin)
};

const STATUS_MAP = {
  [ORDER_STATUS.PENDING]: [DETAILED_ORDER_STATUS.NEW],
  [ORDER_STATUS.PROCESSING]: [
    DETAILED_ORDER_STATUS.CONFIRMED,
    DETAILED_ORDER_STATUS.PREPARING,
  ],
  [ORDER_STATUS.SHIPPING]: [
    DETAILED_ORDER_STATUS.SHIPPING_IN_PROGRESS,
    DETAILED_ORDER_STATUS.DELIVERED,
    DETAILED_ORDER_STATUS.CANCELLATION_REQUESTED,
  ],
  [ORDER_STATUS.COMPLETED]: [DETAILED_ORDER_STATUS.COMPLETED],
  [ORDER_STATUS.CANCELLED]: [
    DETAILED_ORDER_STATUS.PAYMENT_OVERDUE,
    DETAILED_ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.RETURN_REFUND]: [
    DETAILED_ORDER_STATUS.DELIVERY_FAILED,
    DETAILED_ORDER_STATUS.RETURN_REQUESTED,
    DETAILED_ORDER_STATUS.REFUNDED,
  ],
};
// Schema cho timeline entry
const timelineEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(DETAILED_ORDER_STATUS),
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
      type: "String",
      enum: ["user", "admin", "system"],
      required: true,
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
      default: ORDER_STATUS.PENDING,
    },
    deliveryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Delivery",
    },
    orderLines: [orderLineSchema],
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    pointsApplied: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    voucherCode: { type: String, default: null },
    shippingAddress: {
      recipientName: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      street: { type: String, required: true },
      ward: { type: String, required: true },
      district: { type: String, required: true },
      province: { type: String, required: true },
    },
    notes: { type: String },
    payment: { 
      amount : { type: Number },
      paymentMethod: {
        type: String,
        enum: ["VNPAY", "COD", "BANK"],
        required: true,
      },
      status : { type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
      },
      transactionId : { type: String },
      createdAt: { type: Date, default: Date.now }, 
      updatedAt: { type: Date},
    },
    // Timestamps cho các trạng thái
    confirmedAt: { type: Date },
    preparingAt: { type: Date },
    shippingAt: { type: Date },
    deliveredAt: { type: Date },
    
    // Thông tin hủy đơn
    cancelledAt: { type: Date },
    cancelledBy: { type: String, enum: ["user", "admin"] },
    cancelledReason: { type: String },
    cancellationRequestedAt: { type: Date },
    cancellationRequestReason: { type: String },
    
    // Timeline theo dõi lịch sử thay đổi trạng thái
    timeline: [timelineEntrySchema],
    
    // Ghi chú nội bộ
    internalNotes: { type: String },
  },
  { timestamps: true }
);

// Indexes for better performance
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ deliveryId: 1 });
orderSchema.index({ phoneNumber: 1 });

// Compound indexes
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ userId: 1, status: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
export { ORDER_STATUS, DETAILED_ORDER_STATUS, STATUS_MAP };
