import crypto from 'crypto';
import { User } from '../models/index.js';
import { NotFoundError } from '../utils/AppError.js';
import logger from '../utils/logger.js';
import sendEmail from '../utils/sendEmail.js';
import config from '../config/index.js';

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
      firstName: user.name, // Assuming user model has a 'name' field
      url: resetURL,
    });
    logger.info(`Password reset email sent to ${user.email}`);
  } catch (error) {
    // If sending email fails, reset the token fields and re-throw the error
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false }); // Save without validation to ensure reset happens

    logger.error(`Error sending password reset email, rolling back token: ${error}`);
    throw error; // Re-throw the original error to be caught by the global error handler
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

export {
    forgotPassword,
    resetPassword
};
