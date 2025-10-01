import { apiFetch } from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { RegisterRequest, RegisterResponseData, VerifyOtpRequest } from '@/types/user';

class AuthService {
  /**
   * Gửi yêu cầu đăng ký tài khoản mới.
   * @param userData - Dữ liệu đăng ký của người dùng.
   * @returns Promise<ApiResponse<RegisterResponseData>>
   */
  async register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponseData>> {
    return await apiFetch<ApiResponse<RegisterResponseData>>('/auth/register', null, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Gửi yêu cầu xác thực OTP.
   * @param verificationData - Dữ liệu xác thực gồm email và mã OTP.
   * @returns Promise<ApiResponse<null>>
   */
  async verifyOtp(verificationData: VerifyOtpRequest): Promise<ApiResponse<null>> {
    return await apiFetch<ApiResponse<null>>('/auth/verify-otp', null, {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });
  }
}

export const authService = new AuthService();