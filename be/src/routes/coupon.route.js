import express from 'express';
import { couponController } from '../controllers/coupon.controller.js';
import { authMiddleware, isAdmin } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { body, param, query } from 'express-validator';

const router = express.Router();

// Validation schemas
const validateCouponCode = [
  body('couponCode')
    .notEmpty()
    .withMessage('Mã giảm giá không được để trống')
    .isLength({ min: 3, max: 20 })
    .withMessage('Mã giảm giá phải từ 3-20 ký tự')
];

const validateCalculateDiscount = [
  body('couponCode')
    .notEmpty()
    .withMessage('Mã giảm giá không được để trống'),
  body('cartTotal')
    .isNumeric()
    .withMessage('Tổng giá trị giỏ hàng phải là số')
    .isFloat({ min: 0 })
    .withMessage('Tổng giá trị giỏ hàng phải lớn hơn 0'),
  body('cartItems')
    .optional()
    .isArray()
    .withMessage('Danh sách sản phẩm phải là mảng')
];

const validateCreateCoupon = [
  body('code')
    .notEmpty()
    .withMessage('Mã giảm giá không được để trống')
    .isLength({ min: 3, max: 20 })
    .withMessage('Mã giảm giá phải từ 3-20 ký tự')
    .matches(/^[A-Z0-9_-]+$/)
    .withMessage('Mã giảm giá chỉ được chứa chữ hoa, số, gạch dưới và gạch ngang'),
  body('description')
    .notEmpty()
    .withMessage('Mô tả không được để trống')
    .isLength({ min: 10, max: 200 })
    .withMessage('Mô tả phải từ 10-200 ký tự'),
  body('discountType')
    .isIn(['percentage', 'fixed'])
    .withMessage('Loại giảm giá phải là percentage hoặc fixed'),
  body('discountValue')
    .isNumeric()
    .withMessage('Giá trị giảm giá phải là số')
    .isFloat({ min: 1 })
    .withMessage('Giá trị giảm giá phải lớn hơn 0'),
  body('minimumOrderValue')
    .optional()
    .isNumeric()
    .withMessage('Giá trị đơn hàng tối thiểu phải là số')
    .isFloat({ min: 0 })
    .withMessage('Giá trị đơn hàng tối thiểu không được âm'),
  body('maximumDiscountAmount')
    .optional()
    .isNumeric()
    .withMessage('Số tiền giảm tối đa phải là số')
    .isFloat({ min: 1 })
    .withMessage('Số tiền giảm tối đa phải lớn hơn 0'),
  body('startDate')
    .isISO8601()
    .withMessage('Ngày bắt đầu không hợp lệ'),
  body('endDate')
    .isISO8601()
    .withMessage('Ngày kết thúc không hợp lệ'),
  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Giới hạn sử dụng phải là số nguyên dương'),
  body('userUsageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Giới hạn sử dụng của mỗi user phải là số nguyên dương')
];

const validateUpdateCoupon = [
  body('code')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('Mã giảm giá phải từ 3-20 ký tự')
    .matches(/^[A-Z0-9_-]+$/)
    .withMessage('Mã giảm giá chỉ được chứa chữ hoa, số, gạch dưới và gạch ngang'),
  body('description')
    .optional()
    .isLength({ min: 10, max: 200 })
    .withMessage('Mô tả phải từ 10-200 ký tự'),
  body('discountType')
    .optional()
    .isIn(['percentage', 'fixed'])
    .withMessage('Loại giảm giá phải là percentage hoặc fixed'),
  body('discountValue')
    .optional()
    .isNumeric()
    .withMessage('Giá trị giảm giá phải là số')
    .isFloat({ min: 1 })
    .withMessage('Giá trị giảm giá phải lớn hơn 0'),
  body('minimumOrderValue')
    .optional()
    .isNumeric()
    .withMessage('Giá trị đơn hàng tối thiểu phải là số')
    .isFloat({ min: 0 })
    .withMessage('Giá trị đơn hàng tối thiểu không được âm'),
  body('maximumDiscountAmount')
    .optional()
    .isNumeric()
    .withMessage('Số tiền giảm tối đa phải là số')
    .isFloat({ min: 1 })
    .withMessage('Số tiền giảm tối đa phải lớn hơn 0'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Ngày bắt đầu không hợp lệ'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Ngày kết thúc không hợp lệ'),
  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Giới hạn sử dụng phải là số nguyên dương'),
  body('userUsageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Giới hạn sử dụng của mỗi user phải là số nguyên dương')
];

const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('ID không hợp lệ')
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Trang phải là số nguyên dương'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Giới hạn phải từ 1-100'),
  query('status')
    .optional()
    .isIn(['active', 'expired', 'inactive'])
    .withMessage('Trạng thái phải là active, expired hoặc inactive')
];

// Public routes (for authenticated users)
router.post('/validate', 
  authMiddleware, 
  validateCouponCode, 
  validate, 
  couponController.validateCoupon
);

router.post('/calculate-discount', 
  authMiddleware, 
  validateCalculateDiscount, 
  validate, 
  couponController.calculateDiscount
);

router.get('/available', 
  authMiddleware, 
  couponController.getAvailableCoupons
);

// Admin routes
router.use(authMiddleware, isAdmin); // All routes below require admin authentication

// CRUD operations
router.post('/', 
  validateCreateCoupon, 
  validate, 
  couponController.createCoupon
);

router.get('/', 
  validatePagination, 
  validate, 
  couponController.getAllCoupons
);

router.get('/stats', 
  couponController.getCouponStats
);

router.get('/:id', 
  validateMongoId, 
  validate, 
  couponController.getCouponById
);

router.put('/:id', 
  validateMongoId, 
  validateUpdateCoupon, 
  validate, 
  couponController.updateCoupon
);

router.delete('/:id', 
  validateMongoId, 
  validate, 
  couponController.deleteCoupon
);

router.patch('/:id/toggle-status', 
  validateMongoId, 
  validate, 
  couponController.toggleCouponStatus
);

router.get('/:id/usage-history', 
  validateMongoId, 
  validatePagination, 
  validate, 
  couponController.getCouponUsageHistory
);

export default router;
