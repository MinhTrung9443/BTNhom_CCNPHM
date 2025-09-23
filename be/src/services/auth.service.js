import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, OTP } from '../models/index.js';
import { NotFoundError, AppError } from '../utils/AppError.js'; // Thêm AppError
import logger from '../utils/logger.js';
import sendEmail from '../utils/sendEmail.js';
import sendOTP from '../utils/sendOTP.js';
import config from '../config/index.js';
import generateOTP from '../utils/otpGenerator.js';

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError('Không tìm thấy người dùng với email này.');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');

  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  const resetURL = `${config.frontend.url}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      template: 'passwordReset',
      firstName: user.name,
      url: resetURL,
    });
    logger.info(`Password reset email sent to ${user.email}`);
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    logger.error(`Error sending password reset email, rolling back token: ${error}`);
    throw error;
  }
};

const resetPassword = async (token, password) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
        throw new NotFoundError('Token không hợp lệ hoặc đã hết hạn.');
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
};

const register = async (name, email, password, phone, address) => {
    const user = await User.findOne({email});
    if (user) {
      throw new Error('Email đã được sử dụng.');
    }

    const otp = generateOTP();
    await OTP.create({ email, otp });
    await sendOTP({
      email: email,
      subject: 'Your OTP code',
      template: 'OTP',
      firstName: name,
      otp: otp,
    });

    const newUser = new User({ name, email, password, phone, address });
    await newUser.save();
};

const login = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError('Email hoặc mật khẩu không chính xác.', 401);
    }
    if (!user.isVerified) {
        throw new AppError('Tài khoản của bạn chưa được tạo. Vui lòng kiểm tra email.', 403);
    }

    let isPasswordMatch = false;

    // Check if password is already hashed (bcrypt format)
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
        // Password is hashed, use bcrypt comparison
        isPasswordMatch = await bcrypt.compare(password, user.password);
    } else {
        // Password is plain text, compare directly and then hash it for future use
        isPasswordMatch = (password === user.password);

        // If password matches, hash it for future logins
        if (isPasswordMatch) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await User.updateOne({ _id: user._id }, { password: hashedPassword });
            logger.info(`Password hashed for user: ${user.email}`);
        }
    }

    if (!isPasswordMatch) {
        throw new AppError('Email hoặc mật khẩu không chính xác.', 401);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
    user.password = undefined;

    return { user, token };
};

const verifyOTP = async (email, otp) => {
  const otpRecord = await OTP.findOne({ email, otp });
  if (!otpRecord) {
    throw new NotFoundError('OTP không hợp lệ hoặc đã hết hạn.');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError('Người dùng không tồn tại');
  }

  user.isVerified = true;
  await user.save();
  await OTP.deleteOne({ email, otp });
};

export {
    forgotPassword,
    resetPassword,
    register,
    login,
    verifyOTP
};
