import express from "express";
import * as paymentController from "../controllers/payment.controller.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.use(protect);

router.post("/preview-order", paymentController.preview);
router.post("/", paymentController.payment);

export default router;
