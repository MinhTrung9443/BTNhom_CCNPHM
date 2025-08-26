import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/me', userController.getMe);
router.put('/me', userController.updateMe);

export default router;