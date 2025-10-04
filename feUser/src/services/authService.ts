import { apiFetch } from "@/lib/api";
import { ApiResponse } from "@/types/api";
import { RegisterRequest, RegisterResponseData, VerifyOtpRequest } from "@/types/user";

class AuthService {
  /**
   * Gửi yêu cầu đăng ký tài khoản mới.
   * @param userData - Dữ liệu đăng ký của người dùng.
   * @returns Promise<ApiResponse<RegisterResponseData>>
   */
  async register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponseData>> {
    return await apiFetch<ApiResponse<RegisterResponseData>>("/auth/register", null, {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  /**
   * Gửi yêu cầu xác thực OTP.
   * @param verificationData - Dữ liệu xác thực gồm email và mã OTP.
   * @returns Promise<ApiResponse<null>>
   */
  async verifyOtp(verificationData: VerifyOtpRequest): Promise<ApiResponse<null>> {
    return await apiFetch<ApiResponse<null>>("/auth/verify-otp", null, {
      method: "POST",
      body: JSON.stringify(verificationData),
    });
  }

  /**
   * Gửi yêu cầu quên mật khẩu.
   * @param email - Email của người dùng cần đặt lại mật khẩu.
   * @returns Promise<ApiResponse<null>>
   */
  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    return await apiFetch<ApiResponse<null>>("/auth/forgot-password", null, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Gửi yêu cầu đặt lại mật khẩu.
   * @param token - Token để xác thực yêu cầu đặt lại mật khẩu.
   * @param password - Mật khẩu mới.
   * @returns Promise<ApiResponse<null>>
   */
  async resetPassword(token: string, password: string): Promise<ApiResponse<null>> {
    return await apiFetch<ApiResponse<null>>(`/auth/reset-password/${token}`, null, {
      method: "POST",
      body: JSON.stringify({ password }),
    });
  }
}

export const authService = new AuthService();
