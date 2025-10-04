import express from "express";
import * as viewHistoryController from "../controllers/viewHistory.controller.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(protect);

// POST /api/view-history/:productId - Thêm sản phẩm vào lịch sử xem
router.post("/:productId", viewHistoryController.addViewHistory);

// GET /api/view-history - Lấy lịch sử xem với phân trang
router.get("/", viewHistoryController.getViewHistory);

// DELETE /api/view-history/:historyId - Xóa một item khỏi lịch sử xem
router.delete("/:historyId", viewHistoryController.removeViewHistory);

// DELETE /api/view-history - Xóa toàn bộ lịch sử xem
router.delete("/", viewHistoryController.clearViewHistory);

export default router;
