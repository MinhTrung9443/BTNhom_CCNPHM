import { useState } from 'react';
import { toast } from 'react-toastify';
import authService from '../services/authService';
import { validateForgotPasswordForm, validateResetPasswordForm } from '../utils/validation';

/**
 * Custom hook for forgot password functionality
 */
export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const sendResetEmail = async (email) => {
    // Validate email
    const validation = validateForgotPasswordForm({ email });
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    setIsLoading(true);
    
    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
      toast.success('Email khôi phục mật khẩu đã được gửi!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Có lỗi xảy ra. Vui lòng thử lại.';
      
      if (error.response?.status === 400 && error.response.data.errors) {
        return { success: false, errors: error.response.data.errors };
      } else {
        toast.error(errorMessage);
        return { success: false, message: errorMessage };
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetSubmitted = () => {
    setIsSubmitted(false);
  };

  return {
    isLoading,
    isSubmitted,
    sendResetEmail,
    resetSubmitted
  };
};

/**
 * Custom hook for reset password functionality
 */
export const useResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);

  const resetPassword = async (token, password, passwordConfirm) => {
    // Validate form
    const validation = validateResetPasswordForm({ password, passwordConfirm });
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    setIsLoading(true);
    
    try {
      await authService.resetPassword(token, password, passwordConfirm);
      toast.success('Mật khẩu đã được đặt lại thành công!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Có lỗi xảy ra. Vui lòng thử lại.';
      
      if (error.response?.status === 400 && error.response.data.errors) {
        return { success: false, errors: error.response.data.errors };
      } else if (error.response?.status === 404 || error.response?.status === 410) {
        return { 
          success: false, 
          tokenInvalid: true, 
          message: 'Link khôi phục không hợp lệ hoặc đã hết hạn.' 
        };
      } else {
        toast.error(errorMessage);
        return { success: false, message: errorMessage };
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    resetPassword
  };
};
