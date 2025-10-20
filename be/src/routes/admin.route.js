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
import { voucherController } from "../controllers/voucher.controller.js";
import { deliveryController } from "../controllers/delivery.controller.js";
import upload from "../middlewares/upload.js";
import { protect, restrictTo } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { getOrderById, updateOrderStatus } from "../schemas/order.schema.js";
import { adminGetVouchersSchema, adminVoucherIdParamsSchema, adminCreateVoucherSchema, adminUpdateVoucherSchema } from "../schemas/voucher.schema.js";
import { getDeliveriesSchema, createDeliverySchema, updateDeliverySchema, deleteDeliverySchema } from "../schemas/delivery.schema.js";
import { approveReturn } from "../services/order.service.js";

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
router.get("/users-for-chat", adminController.getUsersForChat);

router.get("/users", adminController.getAllUsers);
router.get("/users/search", adminController.searchUsers); // New route for searching users
router.get("/users/:userId", adminController.getUserById);
router.patch("/users/:userId/role", adminController.updateUserRole);
router.patch("/users/:userId/toggle-status", adminController.toggleUserStatus);

// === PRODUCT MANAGEMENT ROUTES ===
router.post("/products", upload.array("images", 10), productController.createProduct);
router.get("/products", adminController.getAllProductsForAdmin);
router.delete("/products/:id", productController.deleteProduct);
router.put("/products/:id", upload.array("images", 10), productController.updateProduct);

// // === COUPON MANAGEMENT ROUTES ===

// === VOUCHER MANAGEMENT ROUTES ===
router.post("/vouchers", validate(adminCreateVoucherSchema), voucherController.createVoucher);
router.put("/vouchers/:id", validate(adminUpdateVoucherSchema), voucherController.updateVoucher);
router.get("/vouchers", validate(adminGetVouchersSchema), voucherController.getAdminVouchers);
router.get("/vouchers/:id", validate(adminVoucherIdParamsSchema), voucherController.getAdminVoucherById);
router.delete("/vouchers/:id", validate(adminVoucherIdParamsSchema), voucherController.deactivateVoucher);
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

// === DELIVERY MANAGEMENT ROUTES ===
router.get("/deliveries", validate(getDeliveriesSchema), deliveryController.getDeliveries);
router.post("/deliveries", validate(createDeliverySchema), deliveryController.createDelivery);
router.put("/deliveries/:id", validate(updateDeliverySchema), deliveryController.updateDelivery);
router.delete("/deliveries/:id", validate(deleteDeliverySchema), deliveryController.deleteDelivery);

// === LOYALTY POINTS MANAGEMENT ROUTES ===

router.get("/loyalty-points", adminController.getAllLoyaltyPoints);
router.get("/loyalty-points/stats", adminController.getLoyaltyStats);
router.get("/loyalty-points/user/:userId", adminController.getUserLoyaltyPoints);
router.post("/loyalty-points/adjust/:userId", adminController.adjustUserPoints);
router.post("/loyalty-points/expire", adminController.expirePoints);

// === NOTIFICATION MANAGEMENT ROUTES ===

router.get("/notifications", getNotificationsHandler);
router.patch("/notifications/:id/read", markAsReadHandler);
router.patch("/notifications/mark-all-read", markAllAsReadHandler);
router.delete("/notifications/:id", deleteNotificationHandler);

// === ORDER MANAGEMENT ROUTES ===
router.get("/orders", orderController.getAllOrdersByAdmin);
router.get("/orders/cancellation-requests", adminController.getOrdersWithCancellationRequests);
router.get("/orders/pending-returns", orderController.getPendingReturns);

router.get("/users/:userId/orders", orderController.getUserOrdersByAdmin);
router.get("/orders/:orderId", validate(getOrderById), orderController.getOrderByAdmin);

// === ORDER STATUS MANAGEMENT ===
router.patch("/orders/:orderId/status", validate(updateOrderStatus), orderController.updateOrderStatusByAdmin);
router.patch("/orders/:orderId/approve-cancellation", adminController.approveCancellationRequest);

// === ADMIN ROUTES ===
router.patch("/orders/:orderId/approve-return", orderController.approveReturn);

export default router;
