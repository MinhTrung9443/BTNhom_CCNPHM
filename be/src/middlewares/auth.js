import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import config from "../config/index.js";

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.", 401)
    );
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    const currentUser = await User.findById(decoded.id).select("-password");
    if (!currentUser) {
      return next(
        new AppError("Người dùng của token này không còn tồn tại.", 401)
      );
    }
    if (!currentUser.isActive) {
      return next(
        new AppError("Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.", 403)
      );
    }
    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AppError("Token không hợp lệ hoặc đã hết hạn.", 401));
  }
};

const restrictTo = (...roles) => {
    return (req, res, next) => {
      console.log(req.user.role);
      console.log(roles);
        if (!roles.includes(req.user.role)) {
          console.log(`User role ${req.user.role} is not authorized to access this route.`);
            return next(new AppError('Bạn không có quyền thực hiện hành động này.', 403));
        }
        next();
    };
};

// Middleware xác thực tùy chọn - cho phép request đi qua dù có token hay không
import logger from '../utils/logger.js';

const optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    logger.info('optionalAuth: No token provided.');
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    logger.info(`optionalAuth: Token decoded for user ID: ${decoded.id}`);

    const currentUser = await User.findById(decoded.id).select("-password");
    if (currentUser) {
      if (!currentUser.isActive) {
        logger.warn(`optionalAuth: User ${currentUser._id} is inactive.`);
        return next();
      }
      req.user = currentUser;
      logger.info(`optionalAuth: User ${currentUser._id} attached to request.`);
    } else {
      logger.warn(`optionalAuth: User with ID ${decoded.id} not found.`);
    }
    next();
  } catch (error) {
    logger.error(`optionalAuth: Invalid token - ${error.message}`);
    next();
  }
};

export { protect, restrictTo, optionalAuth };
