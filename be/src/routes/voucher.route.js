import express from "express";
import { voucherController } from "../controllers/voucher.controller.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Protected routes
router.get("/voucher-available", protect, voucherController.getAvailableVouchers);
router.post("/validate", protect, voucherController.validateVoucher);

export default router;
