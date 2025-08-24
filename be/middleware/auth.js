// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware xác thực token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token không tồn tại hoặc không hợp lệ'
      });
    }

    const token = authHeader.substring(7); // Loại bỏ "Bearer "

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token không tồn tại'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không tồn tại hoặc đã bị khóa'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xác thực token',
      error: error.message
    });
  }
};

// Middleware kiểm tra quyền admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Không có quyền truy cập'
    });
  }
  next();
};

// Middleware kiểm tra tài khoản đã xác thực email
const requireEmailVerified = (req, res, next) => {
  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Vui lòng xác thực email trước khi sử dụng chức năng này'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireEmailVerified
};
