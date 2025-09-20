import express from "express";
import { voucherController } from "../controllers/voucher.controller.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.get("/voucher-available",protect ,voucherController.getAvailableVouchers);
    
export default router;
