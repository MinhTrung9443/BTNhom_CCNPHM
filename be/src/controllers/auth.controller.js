import * as authService from '../services/auth.service.js';

// Express 5 không cần async handler nữa
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    await authService.forgotPassword(email);
    res.status(200).json({
        success: true,
        message: "Yêu cầu đặt lại mật khẩu đã được gửi đến email của bạn.",
    });
};

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    await authService.resetPassword(token, password);
    res.status(200).json({
        success: true,
        message: "Mật khẩu đã được đặt lại thành công.",
    });
};

export {
    forgotPassword,
    resetPassword
};
