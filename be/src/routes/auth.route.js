import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { forgotPasswordSchema, resetPasswordSchema, loginSchema } from '../schemas/auth.schema.js';

const router = express.Router();

router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), authController.resetPassword);
router.post('/register', authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/verify-otp', authController.verifyOTP);
export default router;
