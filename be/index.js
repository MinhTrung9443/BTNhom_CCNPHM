import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
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

import paymentRoutes from "./src/routes/payment.route.js";
dotenv.config();
const app = express();

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev", { stream: logger.stream }));
}

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://localhost:3000",
      "http://localhost:3002",
      "http://localhost:3003",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
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

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
