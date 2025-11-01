import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    roomId: { // ID của ChatRoom chứa tin nhắn này
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true,
      index: true,
    },
    senderId: { // ID của người gửi (User hoặc Admin)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: { // Vai trò của người gửi
      type: String,
      enum: ['user', 'admin'],
      required: true,
    },
    message: { // Nội dung tin nhắn
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    orderReference: { // Tham chiếu đến đơn hàng (tùy chọn)
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null,
      },
      orderCode: {
        type: String,
        default: null,
      },
    },
    // (Tùy chọn) Thêm cờ isRead để đánh dấu đã đọc
    // isRead: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

// Index để lấy tin nhắn theo phòng và sắp xếp theo thời gian
chatMessageSchema.index({ roomId: 1, createdAt: -1 });
// Index để tìm tin nhắn theo orderId
chatMessageSchema.index({ 'orderReference.orderId': 1 });

export default mongoose.model('ChatMessage', chatMessageSchema);
