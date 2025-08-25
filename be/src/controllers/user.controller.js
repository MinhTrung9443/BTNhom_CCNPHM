import * as userService from '../services/user.service.js';
const getMe = (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            user: req.user,
        },
    });
};
 
const updateMe = async (req, res) => {
    const updatedUser = await userService.updateUserProfile(req.user.id, req.body);
    res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin thành công.',
        data: {
            user: updatedUser,
        },
    });
};
export { getMe, updateMe };