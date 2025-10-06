import express from "express";
import * as loyaltyController from "../controllers/loyalty.controller.js";
import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import * as loyaltySchema from "../schemas/loyalty.schema.js";

const router = express.Router();

// Tất cả routes đều yêu cầu authentication
router.use(protect);

// GET /api/loyalty/balance - Lấy số dư điểm tích lũy
router.get("/balance", loyaltyController.getLoyaltyBalance);

// GET /api/loyalty/history - Lấy lịch sử giao dịch điểm
router.get(
  "/history",
  validate(loyaltySchema.getLoyaltyHistorySchema),
  loyaltyController.getLoyaltyHistory
);

export default router;
