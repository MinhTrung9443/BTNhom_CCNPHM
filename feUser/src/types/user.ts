export interface User {
  _id: string;
  name:string;
  email: string;
  avatar?: string;
  phone?: string;
  address?: string;
  isVerified?: boolean;
  isActive?: boolean;
  role?: 'user' | 'admin';
  loyaltyPoints?: number;
  lastLogin?: string | null;
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponseData {
  user: User;
  token: string;
}

/**
 * Dữ liệu người dùng gửi lên khi đăng ký.
 */
export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}

/**
 * Dữ liệu trả về từ API sau khi đăng ký thành công.
 */
export interface RegisterResponseData {
  email: string;
  message: string;
}

/**
 * Dữ liệu gửi lên để xác thực OTP.
 */
export interface VerifyOtpRequest {
  email: string;
  otp: string;
}