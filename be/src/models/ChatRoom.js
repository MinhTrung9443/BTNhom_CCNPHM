import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema(
  {
    userId: { // ID của người dùng khởi tạo chat
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // (Tùy chọn) Có thể thêm adminId nếu muốn gán cuộc chat cho admin cụ thể
    // adminId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'User',
    //   default: null,
    // },
    lastMessage: { // Lưu tin nhắn cuối cùng để hiển thị preview (tùy chọn)
      type: String,
      trim: true,
      maxlength: 200,
    },
    lastMessageTimestamp: { // Thời gian của tin nhắn cuối
        type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'closed'], // Trạng thái phòng chat
      default: 'active',
      index: true,
    },
    userUnreadCount: { // Số tin nhắn user chưa đọc (tùy chọn)
      type: Number,
      default: 0,
    },
    adminUnreadCount: { // Số tin nhắn admin chưa đọc (tùy chọn)
      type: Number,
      default: 0,
    }
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

// Index để tìm kiếm phòng chat của user nhanh hơn
chatRoomSchema.index({ userId: 1, status: 1 });
// Index để sort theo tin nhắn mới nhất
chatRoomSchema.index({ lastMessageTimestamp: -1 });


export default mongoose.model('ChatRoom', chatRoomSchema);
