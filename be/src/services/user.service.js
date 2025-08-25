
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js'; 

const updateUserProfile = async (userId, updateData) => {
    const allowedUpdates = ['name', 'phone', 'address'];
    const updates = {};
    Object.keys(updateData).forEach((key) => {
        if (allowedUpdates.includes(key)) {
            if (updateData[key] !== null && updateData[key] !== undefined) {
                updates[key] = updateData[key];
            }
        }
    });
    if (Object.keys(updates).length === 0) {
        throw new AppError(400, 'Không có thông tin hợp lệ để cập nhật.');
    }

    const user = await User.findByIdAndUpdate(userId, updates, {
        new: true, 
        runValidators: true, 
    }).select('-password');

    if (!user) {
        throw new AppError(404, 'Không tìm thấy người dùng để cập nhật.');
    }

    return user;
};

export { updateUserProfile };