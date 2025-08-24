// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');

// Cấu hình nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SERVICE_USER,
    pass: process.env.EMAIL_SERVICE_PASS
  }
});

// Đăng ký tài khoản
const register = async (req, res) => {
  try {
    const {email, password, confirmPassword, fullName, phone, address } = req.body;

    // Kiểm tra các trường bắt buộc - không cần username
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
    }

    // Kiểm tra mật khẩu xác nhận
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu xác nhận không khớp'
      });
    }

    // Kiểm tra user đã tồn tại
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Tạo token xác thực email
    const emailVerifyToken = otpGenerator.generate(6, {
      upperCase: false,
      specialChars: false,
      alphabets: false
    });

    // Tạo user mới - username có thể null
    const user = new User({
      email,
      password,
      fullName,
      phone,
      address,
      emailVerifyToken,
      emailVerifyExpires: Date.now() + 10 * 60 * 1000 // 10 phút
    });

    await user.save();

    // Gửi email xác thực
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_SERVICE_USER,
        to: email,
        subject: 'Xác thực tài khoản - Bánh Pía Quê Mình',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d4a574;">Chào mừng đến với Bánh Pía Quê Mình!</h2>
            <p>Xin chào <strong>${fullName}</strong>,</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng sử dụng mã OTP sau để xác thực email:</p>
            <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
              <h3 style="color: #333; font-size: 24px; letter-spacing: 5px;">${emailVerifyToken}</h3>
            </div>
            <p>Mã OTP này có hiệu lực trong 10 phút.</p>
            <p>Trân trọng,<br>Đội ngũ Bánh Pía Quê Mình</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Lỗi gửi email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng ký tài khoản'
    });
  }
};

// Đăng nhập
const login = async (req, res) => {
  try {
    console.log('🔍 Login attempt:', req.body); // Debug log
    
    const { email, password, login } = req.body;

    // Chấp nhận cả email hoặc login field
    const loginField = email || login;

    console.log('📧 Login field:', loginField); // Debug log
    console.log('🔑 Password provided:', !!password); // Debug log

    // Kiểm tra input
    if (!loginField || !password) {
      console.log('❌ Missing login field or password'); // Debug log
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin đăng nhập'
      });
    }

    // Tìm user theo email hoặc username
    const user = await User.findOne({
      $or: [
        { email: loginField },

      ]
    });

    console.log('👤 User found:', !!user); // Debug log
    if (user) {
      console.log('📋 User details:', {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified
      });
    }

    if (!user) {
      console.log('❌ User not found for:', loginField); // Debug log
      return res.status(401).json({
        success: false,
        message: 'Thông tin đăng nhập không chính xác'
      });
    }

    // Kiểm tra tài khoản có bị khóa không
    if (!user.isActive) {
      console.log('❌ User account is inactive'); // Debug log
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị khóa'
      });
    }

    // Kiểm tra mật khẩu
    console.log('🔐 Checking password...'); // Debug log
    const isPasswordValid = await user.comparePassword(password);
    console.log('✅ Password valid:', isPasswordValid); // Debug log
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', user.email); // Debug log
      return res.status(401).json({
        success: false,
        message: 'Thông tin đăng nhập không chính xác'
      });
    }

    // Tạo JWT token
    console.log('🎫 Generating JWT token...'); // Debug log
    const token = user.generateAuthToken();
    console.log('✅ Login successful for:', user.email); // Debug log

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          id: user._id,
        
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          address: user.address,
          role: user.role,
          emailVerified: user.emailVerified
        }
      }
    });

  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập'
    });
  }
};

// Xác thực email
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mã OTP'
      });
    }

    const user = await User.findOne({
      email,
      emailVerifyToken: otp,
      emailVerifyExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP không hợp lệ hoặc đã hết hạn'
      });
    }

    user.emailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Xác thực email thành công!'
    });

  } catch (error) {
    console.error('Lỗi xác thực email:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xác thực email'
    });
  }
};

// Lấy thông tin profile
const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Lỗi lấy profile:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin profile'
    });
  }
};

// Cập nhật profile
const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, address } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Lỗi cập nhật profile:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật thông tin'
    });
  }
};

// Đổi mật khẩu
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới không khớp'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
      });
    }

    const user = await User.findById(req.user._id);
    
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });

  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đổi mật khẩu'
    });
  }
};

// Gửi lại mã xác thực email
const resendEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản với email này'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được xác thực'
      });
    }

    // Tạo mã OTP mới
    const emailVerifyToken = otpGenerator.generate(6, {
      upperCase: false,
      specialChars: false,
      alphabets: false
    });

    user.emailVerifyToken = emailVerifyToken;
    user.emailVerifyExpires = Date.now() + 10 * 60 * 1000; // 10 phút
    await user.save();

    // Gửi email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_SERVICE_USER,
        to: email,
        subject: 'Xác thực tài khoản - Bánh Pía Quê Mình',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d4a574;">Xác thực tài khoản</h2>
            <p>Xin chào <strong>${user.fullName}</strong>,</p>
            <p>Vui lòng sử dụng mã OTP sau để xác thực email:</p>
            <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
              <h3 style="color: #333; font-size: 24px; letter-spacing: 5px;">${emailVerifyToken}</h3>
            </div>
            <p>Mã OTP này có hiệu lực trong 10 phút.</p>
            <p>Trân trọng,<br>Đội ngũ Bánh Pía Quê Mình</p>
          </div>
        `
      });

      res.json({
        success: true,
        message: 'Đã gửi lại mã xác thực. Vui lòng kiểm tra email.'
      });

    } catch (emailError) {
      console.error('Lỗi gửi email:', emailError);
      res.status(500).json({
        success: false,
        message: 'Lỗi gửi email xác thực'
      });
    }

  } catch (error) {
    console.error('Lỗi gửi lại mã xác thực:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi gửi lại mã xác thực'
    });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  getProfile,
  updateProfile,
  changePassword,
  resendEmailVerification
};
