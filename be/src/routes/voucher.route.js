import express from "express";
import { voucherController } from "../controllers/voucher.controller.js";
import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { getApplicableVouchersSchema } from "../schemas/voucher.schema.js";

const router = express.Router();

// Public routes
router.get("/my-vouchers", protect, voucherController.getMyVouchers);
router.post("/applicable-vouchers", protect, validate(getApplicableVouchersSchema), voucherController.getApplicableVouchers);

// User voucher management routes
router.get("/public", protect, voucherController.getPublicVouchers);
router.get("/upcoming", voucherController.getUpcomingVouchers); // Không cần auth
router.post("/claim/:voucherId", protect, voucherController.claimVoucher);
router.get("/my", protect, voucherController.getUserVouchers);

export default router;
