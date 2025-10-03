import express from "express";
import { productController } from "../controllers/product.controller.js";
import { protect, optionalAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { searchProductsSchema } from "../schemas/product.schema.js";

const router = express.Router();

// Public routes
router.get("/search", validate(searchProductsSchema), productController.searchProducts);
router.get("/latest", productController.getLatestProducts);
router.get("/bestsellers", productController.getBestSellerProducts);
router.get("/most-viewed", productController.getMostViewedProducts);
router.get("/top-discounts", productController.getTopDiscountProducts);
router.get("/", productController.getAllProducts);
router.post("/by-ids", productController.getProductsByIds);
router.get("/slug/:slug", optionalAuth, productController.getProductBySlug); // Route slug phải đặt trước /:id
router.get("/:id/related", productController.getRelatedProducts);
router.get("/:id", optionalAuth, productController.getProductDetail);
// router.post('/:id/view', protect, productController.recordProductView);
export default router;