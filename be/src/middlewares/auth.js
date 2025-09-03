import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {AppError} from '../utils/AppError.js';
import config from '../config/index.js';

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.', 401));
    }

    try {
        const decoded = jwt.verify(token, config.jwt.secret);

        const currentUser = await User.findById(decoded.id).select('-password');
        if (!currentUser) {
            return next(new AppError('Người dùng của token này không còn tồn tại.', 401));
        }
        req.user = currentUser;
        next();
    } catch (error) {
        return next(new AppError('Token không hợp lệ hoặc đã hết hạn.', 401));
    }
};

export { protect };