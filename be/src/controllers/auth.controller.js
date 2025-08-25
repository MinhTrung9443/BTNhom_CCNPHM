import * as authService from '../services/auth.service.js';

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

const register = async (req, res) => {
    const { name, email, password, phone, address } = req.body;
    await authService.register(name, email, password, phone, address);
    res.status(201).json({
        success: true,
        email: email,
        message: "Tài khoản đã được tạo thành công.",
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);

    res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công.',
        data: {
            user,
            token,
        },
    });
}

const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

  await authService.verifyOTP(email, otp);
  res.status(200).json({
      success: true,
      message: "Mã OTP đã được xác thực thành công.",
  });
}

export {
    forgotPassword,
    resetPassword,
    register,
    login,
    verifyOTP
};