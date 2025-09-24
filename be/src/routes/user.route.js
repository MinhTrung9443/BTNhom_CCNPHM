import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.use(protect);

router.get('/me', userController.getMe);
router.put('/me', upload.single('avatar'), userController.updateMe);
router.get('/favorites', userController.getFavorites);
router.post('/favorites/:productId', userController.toggleFavorite);
router.get('/recently-viewed', userController.getRecentlyViewed);

// Loyalty points routes
router.get('/loyalty-points', userController.getUserLoyaltyPoints);
router.post('/redeem-points', userController.redeemPoints);
router.get('/points-history', userController.getPointsHistory);

// Coupon routes
router.get('/available-coupons', userController.getUserAvailableCoupons);
router.get('/coupon-history', userController.getUserCouponHistory);

// User stats
router.get('/stats', userController.getUserStats);

export default router;
