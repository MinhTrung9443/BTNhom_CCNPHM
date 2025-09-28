import express from "express";
import { adminController } from "../controllers/admin.controller.js";
import * as orderController from "../controllers/order.controller.js";
import { productController } from "../controllers/product.controller.js";
import {
  getNotificationsHandler,
  markAsReadHandler,
  markAllAsReadHandler,
  deleteNotificationHandler,
} from "../controllers/notification.controller.js";
import { categoryController } from "../controllers/category.controller.js";
import { protect, restrictTo } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { getOrderById, updateOrderStatus } from "../schemas/order.schema.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(restrictTo("admin"));

// === DASHBOARD STATS ROUTES (NEW) ===
router.get("/dashboard/stats", adminController.getDashboardStats);
router.get("/dashboard/cash-flow", adminController.getCashFlowStats);
router.get("/dashboard/sales-chart", adminController.getSalesChartData);
router.get("/dashboard/top-products", adminController.getTopSellingProducts);
router.get("/dashboard/delivered-orders", adminController.getDeliveredOrders);
// Giữ lại route thống kê user cũ và bổ sung thêm nếu cần
router.get("/users/stats", adminController.getUserStats);


// === USER MANAGEMENT ROUTES ===

router.get("/users", adminController.getAllUsers);
router.get("/users/:userId", adminController.getUserById);
router.patch("/users/:userId/role", adminController.updateUserRole);
router.post("/products", productController.createProduct);
// === PRODUCT MANAGEMENT ROUTES ===
router.get("/products", adminController.getAllProductsForAdmin);
router.delete("/products/:id", productController.deleteProduct);
router.put("/products/:id", productController.updateProduct);
router.delete("/users/:userId", adminController.deleteUser);

// // === COUPON MANAGEMENT ROUTES ===

// router.get('/coupons', adminController.getAllCoupons);
// router.get('/coupons/stats', adminController.getCouponStats);
// router.post('/coupons', adminController.createCoupon);
// router.put('/coupons/:couponId', adminController.updateCoupon);
// router.delete('/coupons/:couponId', adminController.deleteCoupon);

// === CATEGORY MANAGEMENT ROUTES ===
router.get("/categories", categoryController.getCategories);
router.post("/categories", categoryController.createCategory);
router.put("/categories/:id", categoryController.updateCategory);
router.delete("/categories/:id", categoryController.deleteCategory);

// === LOYALTY POINTS MANAGEMENT ROUTES ===

router.get("/loyalty-points", adminController.getAllLoyaltyPoints);
router.get("/loyalty-points/stats", adminController.getLoyaltyStats);
router.get(
  "/loyalty-points/user/:userId",
  adminController.getUserLoyaltyPoints
);
router.post("/loyalty-points/adjust/:userId", adminController.adjustUserPoints);
router.post("/loyalty-points/expire", adminController.expirePoints);

// === NOTIFICATION MANAGEMENT ROUTES ===

router.get("/notifications", getNotificationsHandler);
router.patch("/notifications/:id/read", markAsReadHandler);
router.patch("/notifications/mark-all-read", markAllAsReadHandler);
router.delete("/notifications/:id", deleteNotificationHandler);

// === ORDER MANAGEMENT ROUTES ===
// === ORDER MANAGEMENT ROUTES ===
router.get("/orders", orderController.getAllOrdersByAdmin);
router.get(
  "/orders/:orderId",
  validate(getOrderById),
  orderController.getOrderByAdmin
);

// === ORDER STATUS MANAGEMENT ===
router.patch(
  "/orders/:orderId/status",
  validate(updateOrderStatus),
  orderController.updateOrderStatusByAdmin
);

export default router;
