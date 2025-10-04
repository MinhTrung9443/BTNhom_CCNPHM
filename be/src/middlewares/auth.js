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
const optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Nếu không có token, cho phép request đi qua
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    const currentUser = await User.findById(decoded.id).select("-password");
    if (currentUser) {
      req.user = currentUser;
    }
    next();
  } catch (error) {
    // Nếu token không hợp lệ, vẫn cho phép request đi qua (không throw error)
    next();
  }
};

export { protect, restrictTo, optionalAuth };
