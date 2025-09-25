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
router.get('/points-history', userController.getPointsHistory);

export default router;
