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
import logger from "./src/utils/logger.js";
import { notFound, errorHandler } from "./src/middlewares/error.js";
import cartRoutes from "./src/routes/cart.route.js";
import * as CronJobService from "./src/services/cronJob.service.js";
import jwt from "jsonwebtoken";

import paymentRoutes from "./src/routes/payment.route.js";
dotenv.config();
const app = express();

// In-memory storage for chat
let activeRooms = new Set();
let chatMessages = {};

// Tạo HTTP server và Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean)
        : [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000",
          ],
    methods: ["GET", "POST"],
  },
});

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev", { stream: logger.stream }));
}

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean)
        : [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000",
          ],
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static("uploads"));
connectDB();

// Khởi tạo cron jobs
CronJobService.init();

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

// Socket.IO connection handling
io.use((socket, next) => {
  logger.info('Socket connection attempt from:', socket.handshake.address);
  const token = socket.handshake.auth.token;
  if (!token) {
    logger.error('No token provided for socket connection');
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
  logger.info(`User ${socket.userId} connected with role ${socket.userRole}`);

  if (socket.userRole === "user") {
    // Don't create room yet, wait for first message
    logger.info(`user ${socket.userId} connected`);
  } else if (socket.userRole === "admin") {
    socket.join("admin");
    logger.info(`Admin ${socket.userId} joined admin room`);
  }

  // Handle sendMessage event
  socket.on("sendMessage", (data) => {
    const { room, message } = data;
    if (!room || !message) return;

    logger.info(
      `Message from ${socket.userRole} ${socket.userId} to room ${room}: ${message}`
    );

    // For customer, room is chat_${userId}, join if not already
    if (socket.userRole === "user") {
      socket.join(room);
      if (!activeRooms.has(room)) {
        logger.info(`Creating new room ${room} for user ${socket.userId}`);
        activeRooms.add(room);
        chatMessages[room] = [];
        io.to("admin").emit("newChatRoom", { room, userId: socket.userId });
        // Update all admins with new active rooms list
        logger.info(
          `Emitting active rooms to admins: ${Array.from(activeRooms)}`
        );
        io.to("admin").emit("activeChatRooms", Array.from(activeRooms));
      }
    }

    const msg = {
      sender: socket.userId,
      senderRole: socket.userRole,
      message,
      room,
      timestamp: new Date().toISOString(),
    };

    if (!chatMessages[room]) {
      chatMessages[room] = [];
    }
    chatMessages[room].push(msg);

    // Emit to the room
    io.to(room).emit("message", msg);
  });

  // Handle joinRoom for admin (to listen to specific room)
  socket.on("joinRoom", (room) => {
    if (socket.userRole === "admin" && activeRooms.has(room)) {
      socket.join(room);
      // Send existing messages
      socket.emit("roomMessages", { room, messages: chatMessages[room] || [] });
    }
  });

  // Handle leaveRoom for admin
  socket.on("leaveRoom", (room) => {
    if (socket.userRole === "admin") {
      socket.leave(room);
    }
  });

  socket.on("getActiveRooms", () => {
    socket.emit("activeChatRooms", Array.from(activeRooms));
  });

  socket.on("disconnect", () => {
    logger.info(`User ${socket.userId} disconnected`);
    if (socket.userRole === "user") {
      const room = `chat_${socket.userId}`;
      socket.leave(room);
      const roomSockets = io.sockets.adapter.rooms.get(room);
      if (!roomSockets || roomSockets.size === 0) {
        activeRooms.delete(room);
        delete chatMessages[room];
        io.to("admin").emit("chatRoomClosed", { room });
        io.to("admin").emit("activeChatRooms", Array.from(activeRooms));
      }
    }
  });
});

// Make io available globally for services
global.io = io;

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
