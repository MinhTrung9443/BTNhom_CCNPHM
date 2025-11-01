import { ChatRoom, ChatMessage, User } from '../models/index.js';
import { AppError, NotFoundError } from '../utils/AppError.js';
import logger from '../utils/logger.js';
import mongoose from 'mongoose';

export const chatService = {
  /**
   * Lấy hoặc tạo phòng chat cho user.
   * @param {string} userId - ID của người dùng
   * @returns {Promise<ChatRoom>} Phòng chat đã tồn tại hoặc mới tạo
   */
  async getOrCreateRoomForUser(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError('User ID không hợp lệ', 400);
    }

    let room = await ChatRoom.findOne({ userId, status: 'active' });

    if (!room) {
      logger.info(`Không tìm thấy phòng chat active cho user ${userId}, tạo phòng mới.`);
      room = new ChatRoom({ userId });
      await room.save();
      logger.info(`Đã tạo phòng chat mới ${room._id} cho user ${userId}`);
      // Thông báo cho admin về phòng mới (qua global.io)
      if (global.io) {
        global.io.to('admin').emit('newChatRoom', { room: `chat_${userId}`, userId });
        // Cập nhật danh sách phòng active cho admin
        const activeRooms = await this.getActiveRooms();
        global.io.to('admin').emit('activeChatRooms', activeRooms.map(r => `chat_${r.userId}`));
      }
    }
    return room;
  },

  /**
   * Lưu tin nhắn mới vào database.
   * @param {string} roomId - ID của phòng chat
   * @param {string} senderId - ID người gửi
   * @param {string} senderRole - Vai trò người gửi ('user' hoặc 'admin')
   * @param {string} message - Nội dung tin nhắn
   * @param {Object} orderReference - Tham chiếu đến đơn hàng (tùy chọn)
   * @returns {Promise<ChatMessage>} Tin nhắn đã lưu
   */
  async addMessage(roomId, senderId, senderRole, message, orderReference = null) {
    if (!mongoose.Types.ObjectId.isValid(roomId) || !mongoose.Types.ObjectId.isValid(senderId)) {
      throw new AppError('Room ID hoặc Sender ID không hợp lệ', 400);
    }
    if (!message || message.trim() === '') {
      throw new AppError('Nội dung tin nhắn không được rỗng', 400);
    }

    // Validate orderReference nếu có
    if (orderReference) {
      if (!orderReference.orderId || !orderReference.orderCode) {
        throw new AppError('Thông tin đơn hàng không hợp lệ', 400);
      }
      if (!mongoose.Types.ObjectId.isValid(orderReference.orderId)) {
        throw new AppError('Order ID không hợp lệ', 400);
      }
    }

    // Check if this is the first message
    const roomBeforeUpdate = await ChatRoom.findById(roomId).select('lastMessage').lean();
    const isFirstMessage = !roomBeforeUpdate.lastMessage;

    const chatMessage = new ChatMessage({
      roomId,
      senderId,
      senderRole,
      message: message.trim(),
      orderReference: orderReference || undefined,
    });
    await chatMessage.save();

    // Update lastMessage and timestamp in ChatRoom
    await ChatRoom.findByIdAndUpdate(roomId, {
      lastMessage: message.trim(),
      lastMessageTimestamp: chatMessage.createdAt,
      updatedAt: Date.now() // Update manually to trigger index/sort if needed
    });

    logger.debug(`Đã lưu tin nhắn mới vào phòng ${roomId}`);

    const savedMsgObject = chatMessage.toObject();
    savedMsgObject.isFirstMessage = isFirstMessage;

    return savedMsgObject;
  },

  /**
   * Lấy lịch sử tin nhắn của một phòng chat (có thể thêm phân trang sau).
   * @param {string} roomId - ID của phòng chat
   * @param {number} limit - Số lượng tin nhắn muốn lấy (mặc định 10)
   * @returns {Promise<ChatMessage[]>} Mảng các tin nhắn
   */
  async getRoomMessages(roomId, { limit = 10, before = null } = {}) {
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      throw new AppError('Room ID không hợp lệ', 400);
    }

    const query = { roomId };
    if (before) {
      // Validate 'before' is a valid date string
      if (isNaN(new Date(before).getTime())) {
        throw new AppError('Tham số `before` không phải là ngày hợp lệ', 400);
      }
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: -1 }) // Lấy tin nhắn mới nhất trước
      .limit(limit)
      .populate('senderId', 'name avatar') // Lấy thông tin cơ bản người gửi
      .populate('orderReference.orderId', 'orderCode totalAmount status createdAt orderLines') // Populate thông tin đơn hàng với orderLines
      .lean(); // Dùng lean() để tăng tốc độ truy vấn

    logger.debug(`Lấy ${messages.length} tin nhắn cho phòng ${roomId}` + (before ? ` trước ${before}` : ''));
    return messages.reverse(); // Đảo ngược lại để hiển thị đúng thứ tự trong chunk
  },

  /**
   * Lấy danh sách các phòng chat đang active.
   * @returns {Promise<ChatRoom[]>} Mảng các phòng chat active
   */
  async getActiveRooms() {
    const rooms = await ChatRoom.find({ status: 'active' })
      .sort({ lastMessageTimestamp: -1 }) // Sắp xếp phòng có tin nhắn mới lên đầu
      .populate('userId', 'name email') // Lấy thông tin user
      .lean();
    logger.debug(`Lấy được ${rooms.length} phòng chat active`);
    return rooms;
  },

  /**
  * (Tùy chọn) Tìm phòng chat bằng userId
  * @param {string} userId
  * @returns {Promise<ChatRoom | null>}
  */
  async findRoomByUserId(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }
    return await ChatRoom.findOne({ userId, status: 'active' }).lean();
  }

  // (Tùy chọn) Thêm các hàm khác: closeRoom, markAsRead,...
};
