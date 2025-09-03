import express from "express";
import { productController } from "../controllers/product.controller.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.get("/latest", productController.getLatestProducts);
router.get("/bestsellers", productController.getBestSellerProducts);
router.get("/most-viewed", productController.getMostViewedProducts);
router.get("/top-discounts", productController.getTopDiscountProducts);
router.get("/", productController.getAllProducts);

// Routes có thể cần auth (optional)
router.get("/:id", productController.getProductDetail);

export default router;