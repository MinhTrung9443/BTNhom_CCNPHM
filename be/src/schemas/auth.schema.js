import Joi from 'joi';

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.base': 'Email phải là một chuỗi ký tự.',
    'string.empty': 'Email không được để trống.',
    'string.email': 'Email không hợp lệ.',
    'any.required': 'Email là trường bắt buộc.'
  })
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required().messages({
    'string.base': 'Mật khẩu phải là một chuỗi ký tự.',
    'string.empty': 'Mật khẩu không được để trống.',
    'string.min': 'Mật khẩu phải có ít nhất {#limit} ký tự.',
    'any.required': 'Mật khẩu là trường bắt buộc.'
  }),
  passwordConfirm: Joi.any().equal(Joi.ref('password')).required().label('Confirm password').messages({
    'any.only': 'Mật khẩu xác nhận không khớp.'
  }),
});

export {
    forgotPasswordSchema,
    resetPasswordSchema
};
