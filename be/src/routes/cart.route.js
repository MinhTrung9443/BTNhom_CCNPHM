import express from 'express';
import {
    upsertCartItem,
    getCart,
    removeItemFromCart
} from '../controllers/cartController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);
router.post('/items', upsertCartItem);
router.get('/', getCart);
router.delete('/items/:productId', removeItemFromCart);

export default router;