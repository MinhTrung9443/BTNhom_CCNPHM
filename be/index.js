import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.route.js";
import userRoutes from "./src/routes/user.route.js";
import productRoutes from "./src/routes/product.route.js";
import orderRoutes from "./src/routes/order.route.js";
import uploadRoutes from "./src/routes/upload.route.js";
import voucherRoutes from "./src/routes/voucher.route.js";
import reviewRoutes from "./src/routes/review.route.js";
import adminRoutes from "./src/routes/admin.route.js";
import categoryRoutes from "./src/routes/category.route.js";
import viewHistoryRoutes from "./src/routes/viewHistory.route.js";
import loyaltyRoutes from "./src/routes/loyalty.route.js";
import articleRoutes from "./src/routes/article.route.js";
import commentRoutes from "./src/routes/comment.route.js";
import articleInteractionRoutes from './src/routes/article-interaction.route.js';
import notificationRoutes from './src/routes/notification.route.js';
import logger from "./src/utils/logger.js";
import { notFound, errorHandler } from "./src/middlewares/error.js";
import cartRoutes from "./src/routes/cart.route.js";
import * as CronJobService from "./src/services/cronJob.service.js";
import jwt from "jsonwebtoken";

import paymentRoutes from "./src/routes/payment.route.js";
dotenv.config();
const app = express();

import { chatService } from './src/services/chat.service.js'; // Import service mới

// Tạo HTTP server và Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean)
        : ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev", { stream: logger.stream }));
}

// app.use(
//   cors({
//     origin:
//       process.env.NODE_ENV === "production"
//         ? [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean)
//         : ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
//     credentials: true,
//   })
// );

app.use(
  cors()
);

app.use("/uploads", express.static("uploads"));
connectDB();

// Khởi tạo cron jobs
CronJobService.init();

// Route upload phải được định nghĩa TRƯỚC body parser
app.use("/api/upload", uploadRoutes);

// Tăng giới hạn kích thước request body cho các route khác
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/view-history", viewHistoryRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/comments", commentRoutes);
app.use('/api/article-interactions', articleInteractionRoutes);
app.use('/api/v1/notifications', notificationRoutes);

app.use(notFound);
app.use(errorHandler);

// Socket.IO connection handling
io.use((socket, next) => {
  logger.info("Socket connection attempt from:", socket.handshake.address);
  const token = socket.handshake.auth.token;
  if (!token) {
    logger.error("No token provided for socket connection");
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    logger.info(`Socket auth successful for user ${socket.userId} with role ${socket.userRole}`);
    next();
  } catch (err) {
    logger.error(`Socket auth failed for token: ${err.message}`);
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.userId;
  const userRole = socket.userRole;
  logger.info(`User ${userId} (${userRole}) connected`);

  const userRoomIdentifier = `chat_${userId}`;

  if (userRole === 'user') {
    // User joins their notification room
    socket.join(`user_${userId}`);
    logger.info(`User ${userId} joined notification room user_${userId}`);
    
    // User connects: Get or create their room, join the socket room, and get initial messages.
    chatService.getOrCreateRoomForUser(userId)
      .then(async (room) => {
        socket.join(userRoomIdentifier);
        logger.info(`User ${userId} joined their dedicated room ${userRoomIdentifier}`);

        // Also send the first page of messages
        const messages = await chatService.getRoomMessages(room._id, { limit: 30 });
        const formattedMessages = messages.map(msg => ({
            _id: msg._id,
            sender: msg.senderId ? msg.senderId._id : null,
            senderRole: msg.senderRole,
            message: msg.message,
            room: userRoomIdentifier,
            timestamp: msg.createdAt.toISOString(),
        }));
        socket.emit("roomMessages", { room: userRoomIdentifier, messages: formattedMessages });
        logger.info(`Sent initial message history to user ${userId} for room ${userRoomIdentifier}`);
      })
      .catch(err => logger.error(`Error getting/creating room for user ${userId}: ${err.message}`));

  } else if (userRole === 'admin') {
    // Admin connects: Join the 'admin' room to receive broadcasts.
    socket.join('admin');
    logger.info(`Admin ${userId} joined the main admin room`);

    // Also join all active user rooms to listen to all conversations.
    chatService.getActiveRooms()
      .then(rooms => {
         const roomIdentifiers = rooms.map(room => `chat_${room.userId?._id}`);
         roomIdentifiers.forEach(id => socket.join(id));
         logger.info(`Admin ${userId} has joined all active rooms: ${roomIdentifiers.join(', ')}`);
      })
      .catch(err => logger.error(`Error getting active rooms for admin ${userId}: ${err.message}`));
  }

  // Handles a new message from any client
  socket.on('sendMessage', async (data) => {
    const { room: roomIdentifier, message } = data;
    if (!roomIdentifier || !message || !message.trim()) return;

    const targetUserId = roomIdentifier.split('_')[1];
    if (!targetUserId) {
        return logger.warn(`sendMessage: Invalid roomIdentifier received: ${roomIdentifier}`);
    }

    try {
      // Find the room in the DB.
      const room = await chatService.findRoomByUserId(targetUserId);

      if (!room) {
        return logger.error(`sendMessage: Could not find a chat room in DB for identifier ${roomIdentifier}`);
      }

      // Save the message to the database
      const savedMessage = await chatService.addMessage(room._id, userId, userRole, message);

      const messageToSend = {
        _id: savedMessage._id,
        sender: userId,
        senderRole: userRole,
        message: savedMessage.message,
        room: roomIdentifier,
        timestamp: savedMessage.createdAt.toISOString(),
      };

      // Broadcast the message to the room (which includes the user and all listening admins)
      io.to(roomIdentifier).emit('message', messageToSend);
      logger.info(`Broadcasted message from ${userRole} ${userId} to room ${roomIdentifier}`);

      // If a user sends the first message, it makes the room "active". Notify admins.
      if (savedMessage.isFirstMessage) {
           io.to('admin').emit('newChatRoom', { room: roomIdentifier, userId: targetUserId });
      }

    } catch (error) {
      logger.error(`Error processing sendMessage from ${userId} to ${roomIdentifier}: ${error.message}`);
    }
  });

  // Handle joinRoom for admin (to listen to specific room)
  socket.on("joinRoom", async (roomIdentifier) => {
    if (socket.userRole !== "admin") return;

    const targetUserId = roomIdentifier.split('_')[1];
    if (!targetUserId) {
        return logger.warn(`joinRoom: Invalid room identifier: ${roomIdentifier}`);
    }

    try {
        const room = await chatService.findRoomByUserId(targetUserId);
        if (room) {
            socket.join(roomIdentifier);
            const messages = await chatService.getRoomMessages(room._id, { limit: 30 });
            const formattedMessages = messages.map(msg => ({
                _id: msg._id,
                sender: msg.senderId ? msg.senderId._id : null,
                senderRole: msg.senderRole,
                message: msg.message,
                room: roomIdentifier,
                timestamp: msg.createdAt.toISOString(),
            }));
            socket.emit("roomMessages", { room: roomIdentifier, messages: formattedMessages });
            logger.info(`Admin ${socket.userId} joined room ${roomIdentifier} and received history.`);
        } else {
            logger.warn(`Admin tried to join a room that does not exist in DB: ${roomIdentifier}`);
            socket.emit("roomMessages", { room: roomIdentifier, messages: [] });
        }
    } catch (error) {
        logger.error(`Error in joinRoom for ${roomIdentifier}: ${error.message}`);
    }
  });

  // Handle leaveRoom for admin
  socket.on("leaveRoom", (room) => {
    if (socket.userRole === "admin") {
      socket.leave(room);
    }
  });

  // Handle getOlderMessages for pagination
  socket.on('getOlderMessages', async ({ roomIdentifier, before }) => {
    const targetUserId = roomIdentifier.split('_')[1];
    if (!targetUserId) {
        return logger.warn(`getOlderMessages: Invalid roomIdentifier: ${roomIdentifier}`);
    }

    // Security Check: A user can only request older messages for their own room.
    if (socket.userRole === 'user' && socket.userId !== targetUserId) {
        return logger.warn(`User ${socket.userId} attempted to get messages for another user's room ${targetUserId}.`);
    }

    if (!roomIdentifier || !before) {
        logger.warn(`getOlderMessages: Missing parameters from user ${socket.userId}`);
        return;
    }

    try {
        const room = await chatService.findRoomByUserId(targetUserId);
        if (room) {
            const olderMessages = await chatService.getRoomMessages(room._id, { limit: 20, before });

            const formattedMessages = olderMessages.map(msg => ({
                _id: msg._id,
                sender: msg.senderId ? msg.senderId._id : null,
                senderRole: msg.senderRole,
                message: msg.message,
                room: roomIdentifier,
                timestamp: msg.createdAt.toISOString(),
            }));

            socket.emit('olderMessages', { room: roomIdentifier, messages: formattedMessages });
            logger.info(`Sent ${olderMessages.length} older messages for room ${roomIdentifier} to user ${socket.userId}`);
        } else {
            logger.warn(`getOlderMessages: Room not found in DB for identifier ${roomIdentifier}`);
        }
    } catch (error) {
        logger.error(`Error in getOlderMessages for room ${roomIdentifier}: ${error.message}`);
    }
  });

  socket.on("getActiveRooms", async () => {
      if (socket.userRole !== 'admin') return;
      try {
        const rooms = await chatService.getActiveRooms();
        const roomIdentifiers = rooms.map(room => `chat_${room.userId?._id}`);
        socket.emit("activeChatRooms", roomIdentifiers);
      } catch(error) {
        logger.error(`Error in getActiveRooms for admin ${socket.userId}: ${error.message}`);
      }
  });

  socket.on('adminInitiateChat', async ({ targetUserId }) => {
    if (socket.userRole !== 'admin') {
        return logger.warn(`User ${socket.userId} (not admin) attempted to initiate chat.`);
    }
    if (!targetUserId) {
        return logger.warn(`adminInitiateChat: a targetUserId must be provided by admin ${socket.userId}.`);
    }

    try {
        // This function already handles creating a room if it doesn't exist
        const room = await chatService.getOrCreateRoomForUser(targetUserId);
        const roomIdentifier = `chat_${targetUserId}`;

        // Make the initiating admin join the socket room
        socket.join(roomIdentifier);
        logger.info(`Admin ${socket.userId} initiated and joined room ${roomIdentifier}`);

        // Also notify other admins that this room is now active
        io.to('admin').emit('newChatRoom', { room: roomIdentifier, userId: targetUserId });

        // Get chat history for the admin
        const messages = await chatService.getRoomMessages(room._id, { limit: 30 });
        const formattedMessages = messages.map(msg => ({
            _id: msg._id,
            sender: msg.senderId ? msg.senderId._id : null,
            senderRole: msg.senderRole,
            message: msg.message,
            room: roomIdentifier,
            timestamp: msg.createdAt.toISOString(),
        }));

        // Send room info and history back to the initiating admin
        socket.emit("roomMessages", { room: roomIdentifier, messages: formattedMessages });

    } catch (error) {
        logger.error(`Error during adminInitiateChat for target ${targetUserId}: ${error.message}`);
        socket.emit('chatError', { message: 'Could not initiate chat with user.' });
    }
  });

  socket.on("disconnect", () => {
    logger.info(`User ${socket.userId} disconnected`);
    // No need to manage rooms on disconnect, they are persistent.
  });
});

// Make io available globally for services
global.io = io;

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
