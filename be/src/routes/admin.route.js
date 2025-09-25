import express from "express";
import { adminController } from "../controllers/admin.controller.js";
import { protect, restrictTo } from "../middlewares/auth.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin'));

// === USER MANAGEMENT ROUTES ===

router.get('/users', adminController.getAllUsers);
router.get('/users/stats', adminController.getUserStats);
router.get('/users/:userId', adminController.getUserById);
router.patch('/users/:userId/role', adminController.updateUserRole);
router.delete('/users/:userId', adminController.deleteUser);

// === COUPON MANAGEMENT ROUTES ===

router.get('/coupons', adminController.getAllCoupons);
router.get('/coupons/stats', adminController.getCouponStats);
router.post('/coupons', adminController.createCoupon);
router.put('/coupons/:couponId', adminController.updateCoupon);
router.delete('/coupons/:couponId', adminController.deleteCoupon);

// === LOYALTY POINTS MANAGEMENT ROUTES ===

router.get('/loyalty-points', adminController.getAllLoyaltyPoints);
router.get('/loyalty-points/stats', adminController.getLoyaltyStats);
router.get('/loyalty-points/user/:userId', adminController.getUserLoyaltyPoints);
router.post('/loyalty-points/adjust/:userId', adminController.adjustUserPoints);
router.post('/loyalty-points/expire', adminController.expirePoints);

export default router;
