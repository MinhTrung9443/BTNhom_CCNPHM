import express from 'express';
import * as userController from '../controllers/user.controller.js';
import * as loyaltyController from '../controllers/loyalty.controller.js';
import { protect } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.use(protect);

router.get('/me', userController.getMe);
router.put('/me', upload.single('avatar'), userController.updateMe);
router.get('/me/loyalty-points', userController.getCurrentLoyaltyPoints);
router.get('/favorites', userController.getFavorites);
router.post('/favorites/:productId', userController.toggleFavorite);
router.get('/recently-viewed', userController.getRecentlyViewed);

// Address management routes
router.get('/me/addresses', userController.getAddresses);
router.post('/me/addresses', userController.addAddress);
router.put('/me/addresses/:addressId', userController.updateAddress);
router.delete('/me/addresses/:addressId', userController.deleteAddress);
router.patch('/me/addresses/:addressId/default', userController.setDefaultAddress);
router.get('/me/addresses/default', userController.getDefaultAddress);

// Loyalty points routes
router.get('/loyalty-points', userController.getUserLoyaltyPoints);
router.get('/points-history', userController.getPointsHistory);
router.get('/loyalty-transactions', loyaltyController.getLoyaltyTransactions);
router.get('/expiring-points', loyaltyController.getExpiringPoints);

// Daily check-in routes
router.post('/daily-checkin', userController.dailyCheckin);
router.get('/checkin-status', userController.getCheckinStatus);

export default router;
