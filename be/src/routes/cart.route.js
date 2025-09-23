import express from 'express';
import {
    upsertCartItem,
    getCart,
    removeItemFromCart,
    applyCoupon,
    removeCoupon,
    getAvailableCoupons,
    getUserLoyaltyPoints,
    redeemPoints,
    getPointsHistory
} from '../controllers/cartController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

// Cart item management
router.post('/items', upsertCartItem);
router.get('/', getCart);
router.delete('/items/:productId', removeItemFromCart);

// Coupon management
router.post('/apply-coupon', applyCoupon);
router.delete('/remove-coupon', removeCoupon);
router.get('/available-coupons', getAvailableCoupons);

// Loyalty points management
router.get('/loyalty-points', getUserLoyaltyPoints);
router.post('/redeem-points', redeemPoints);
router.get('/points-history', getPointsHistory);

export default router;
