import express from "express";
import { voucherController } from "../controllers/voucher.controller.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.get("/my-vouchers", protect, voucherController.getMyVouchers);
    
export default router;
