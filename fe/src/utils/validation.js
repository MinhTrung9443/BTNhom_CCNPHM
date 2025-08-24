/**
 * Validation utilities - tương đương với Joi schema từ backend
 */

/**
 * Validate email format
 * @param {string} email 
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: 'Email không được để trống.' };
  }
  
  if (typeof email !== 'string') {
    return { isValid: false, message: 'Email phải là một chuỗi ký tự.' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Email không hợp lệ.' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate password
 * @param {string} password 
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Mật khẩu không được để trống.' };
  }
  
  if (typeof password !== 'string') {
    return { isValid: false, message: 'Mật khẩu phải là một chuỗi ký tự.' };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate password confirmation
 * @param {string} password 
 * @param {string} passwordConfirm 
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validatePasswordConfirm = (password, passwordConfirm) => {
  if (!passwordConfirm) {
    return { isValid: false, message: 'Xác nhận mật khẩu không được để trống.' };
  }
  
  if (password !== passwordConfirm) {
    return { isValid: false, message: 'Mật khẩu xác nhận không khớp.' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate forgot password form
 * @param {Object} formData 
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateForgotPasswordForm = (formData) => {
  const errors = {};
  let isValid = true;
  
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
    isValid = false;
  }
  
  return { isValid, errors };
};

/**
 * Validate reset password form
 * @param {Object} formData 
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateResetPasswordForm = (formData) => {
  const errors = {};
  let isValid = true;
  
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
    isValid = false;
  }
  
  const passwordConfirmValidation = validatePasswordConfirm(
    formData.password, 
    formData.passwordConfirm
  );
  if (!passwordConfirmValidation.isValid) {
    errors.passwordConfirm = passwordConfirmValidation.message;
    isValid = false;
  }
  
  return { isValid, errors };
};
