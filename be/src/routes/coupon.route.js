import express from 'express';
import { couponController } from '../controllers/coupon.controller.js';
import { protect, restrictTo } from '../middlewares/auth.js';

const router = express.Router();

// Public routes (for authenticated users)
router.post('/validate', 
  protect, 
  couponController.validateCoupon
);

router.post('/calculate-discount', 
  protect, 
  couponController.calculateDiscount
);

router.get('/available', 
  protect, 
  couponController.getAvailableCoupons
);

// Admin routes
router.use(protect, restrictTo('admin')); // All routes below require admin authentication

// CRUD operations
router.post('/', 
  couponController.createCoupon
);

router.get('/', 
  couponController.getAllCoupons
);

router.get('/stats', 
  couponController.getCouponStats
);

router.get('/:id', 
  couponController.getCouponById
);

router.put('/:id', 
  couponController.updateCoupon
);

router.delete('/:id', 
  couponController.deleteCoupon
);

router.patch('/:id/toggle-status', 
  couponController.toggleCouponStatus
);

router.get('/:id/usage-history', 
  couponController.getCouponUsageHistory
);

export default router;
