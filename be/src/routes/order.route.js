import express from "express";
import * as OrderController from "../controllers/order.controller.js";
import { protect, restrictTo } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { getUserOrders, previewOrder, placeOrder, cancelOrder, requestReturn, approveReturn, confirmReceived } from "../schemas/order.schema.js";

const router = express.Router();

// All routes below are protected and require a valid token
router.use(protect);

// === USER ROUTES ===
router.post("/preview", restrictTo("user"), validate(previewOrder), OrderController.previewOrder);
router.post("/", restrictTo("user"), validate(placeOrder), OrderController.placeOrder);
router.post("/create-order-momo", restrictTo("user"), validate(placeOrder), OrderController.placeMomoOrder);
router.post("/momo-return", restrictTo("user"), OrderController.handleMomoReturn);
router.post("/my/:orderId/retry-momo", restrictTo("user"), OrderController.retryMomoPayment);
router.get("/my", restrictTo("user"), validate(getUserOrders), OrderController.getUserOrders);
router.get("/my/stats", restrictTo("user"), OrderController.getUserOrderStats);
router.get("/latest-address", restrictTo("user"), OrderController.getLatestOrderAddress);
router.get("/:orderId", restrictTo("user"), OrderController.getOrderDetail);
router.patch("/my/:orderId/cancel", restrictTo("user"), validate(cancelOrder), OrderController.cancelOrderByUser);
router.post("/:orderId/request-return", restrictTo("user"), validate(requestReturn), OrderController.requestReturn);
router.patch("/my/:orderId/confirm-received", restrictTo("user"), validate(confirmReceived), OrderController.confirmOrderReceived);

export default router;
