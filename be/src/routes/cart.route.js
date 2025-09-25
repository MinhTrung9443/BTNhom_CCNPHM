import express from 'express';
import {
    upsertCartItem,
    getCart,
    removeItemFromCart,
    updateCartItemQuantity
} from '../controllers/cartController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

// Cart item management
router.post('/items', upsertCartItem);
router.get('/', getCart);
router.delete('/items/:productId', removeItemFromCart);
router.put('/items', updateCartItemQuantity);

export default router;
