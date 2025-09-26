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
import logger from "./src/utils/logger.js";
import { notFound, errorHandler } from "./src/middlewares/error.js";
import cartRoutes from "./src/routes/cart.route.js";
import * as CronJobService from "./src/services/cronJob.service.js";
import jwt from "jsonwebtoken";

import paymentRoutes from "./src/routes/payment.route.js";
dotenv.config();
const app = express();

// Tạo HTTP server và Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev", { stream: logger.stream }));
}

// CORS configuration
app.use(
  cors()
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

app.use(notFound);
app.use(errorHandler);

// Socket.IO connection handling
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  logger.info(`User ${socket.userId} connected with role ${socket.userRole}`);

  // Join admin room if user is admin
  if (socket.userRole === 'admin') {
    socket.join('admin');
    logger.info(`Admin ${socket.userId} joined admin room`);
  }

  socket.on('disconnect', () => {
    logger.info(`User ${socket.userId} disconnected`);
  });
});

// Make io available globally for services
global.io = io;

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
