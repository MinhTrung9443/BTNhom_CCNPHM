import Joi from "joi";

const forgotPasswordSchema = {
  body: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.base": "Email phải là một chuỗi ký tự.",
        "string.empty": "Email không được để trống.",
        "string.email": "Email không hợp lệ.",
        "any.required": "Email là trường bắt buộc.",
      }),
  }),
};

const resetPasswordSchema = {
  body: Joi.object({
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
      .required()
      .messages({
        "string.base": "Mật khẩu phải là một chuỗi ký tự.",
        "string.empty": "Mật khẩu không được để trống.",
        "string.min": "Mật khẩu phải có ít nhất {#limit} ký tự.",
        "string.pattern.base": "Mật khẩu phải có ít nhất một chữ hoa, một chữ thường và một số.",
        "any.required": "Mật khẩu là trường bắt buộc.",
      }),
  }),
};

const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Email không hợp lệ.",
      "any.required": "Email là bắt buộc.",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Mật khẩu phải có ít nhất 6 ký tự.",
      "any.required": "Mật khẩu là bắt buộc.",
    }),
  }),
};
export { forgotPasswordSchema, resetPasswordSchema, loginSchema };
