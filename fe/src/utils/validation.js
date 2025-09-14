/**
 * Validation utilities - equivalent to the Joi schema from the backend
 */

/**
 * Validate email format
 * @param {string} email 
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: 'Email is required.' };
  }
  
  if (typeof email !== 'string') {
    return { isValid: false, message: 'Email must be a string.' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Invalid email format.' };
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
    return { isValid: false, message: 'Password is required.' };
  }
  
  if (typeof password !== 'string') {
    return { isValid: false, message: 'Password must be a string.' };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long.' };
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
    return { isValid: false, message: 'Password confirmation is required.' };
  }
  
  if (password !== passwordConfirm) {
    return { isValid: false, message: 'Passwords do not match.' };
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