import express from "express";
import { voucherController } from "../controllers/voucher.controller.js";
import { protect } from "../middlewares/auth.js";
import {validate} from "../middlewares/validate.js";
import { getApplicableVouchersSchema } from "../schemas/voucher.schema.js";

const router = express.Router();

// Public routes
router.get("/my-vouchers", protect, voucherController.getMyVouchers);
router.post(
    "/applicable-vouchers",
    protect,
    validate(getApplicableVouchersSchema),
    voucherController.getApplicableVouchers
);
    
export default router;
