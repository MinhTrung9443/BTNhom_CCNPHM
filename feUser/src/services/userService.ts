import { apiFetch } from "@/lib/api";
import { ApiResponse } from "@/types/api";
import { FavoriteProduct, FavoritesResponse, ToggleFavoriteResponse } from "@/types/favorite";

class UserService {
  /**
   * Lấy danh sách sản phẩm yêu thích của người dùng.
   * @param accessToken - Bắt buộc, vì đây là endpoint cần xác thực.
   */
  async getFavorites(accessToken: string): Promise<ApiResponse<FavoriteProduct[]>> {
    if (!accessToken) {
      // Trả về một cấu trúc hợp lệ nếu không có token
      return {
        success: false,
        message: "Yêu cầu xác thực.",
        data: [],
      };
    }

    // API này có cấu trúc response đặc biệt, cần được chuẩn hóa
    const rawResponse: FavoritesResponse = await apiFetch("/users/favorites", accessToken, {
      method: "GET",
      cache: "no-store", // Không cache danh sách yêu thích để luôn cập nhật
    });

    // Chuẩn hóa response về dạng ApiResponse<T>
    return {
      success: true,
      message: "Lấy danh sách yêu thích thành công.",
      data: rawResponse.favorites || [],
    };
  }

  /**
   * Thêm hoặc xóa một sản phẩm khỏi danh sách yêu thích.
   * @param productId - ID của sản phẩm để toggle.
   * @param accessToken - Bắt buộc, vì đây là endpoint cần xác thực.
   */
  async toggleFavorite(productId: string, accessToken: string): Promise<ApiResponse<{ favorited: boolean }>> {
    if (!accessToken) {
      return {
        success: false,
        message: "Yêu cầu xác thực.",
        data: { favorited: false },
      };
    }

    const rawResponse: ToggleFavoriteResponse = await apiFetch(`/users/favorites/${productId}`, accessToken, {
      method: "POST",
      cache: "no-store",
    });

    // Chuẩn hóa response về dạng ApiResponse<T>
    return {
      success: true,
      message: rawResponse.message,
      data: {
        favorited: rawResponse.favorited,
      },
    };
  }

  /**
   * Lấy thông tin profile của người dùng hiện tại.
   * @param accessToken - Token xác thực (optional, sẽ tự động lấy từ session)
   */
  async getProfile(accessToken?: string): Promise<ApiResponse<{ user: any }>> {
    return await apiFetch<ApiResponse<{ user: any }>>("/users/me", accessToken, {
      method: "GET",
      cache: "no-store",
    });
  }

  /**
   * Cập nhật thông tin profile của người dùng.
   * @param data - Dữ liệu cập nhật (có thể là object hoặc FormData cho upload file)
   * @param accessToken - Token xác thực (optional, sẽ tự động lấy từ session)
   */
  async updateProfile(data: any, accessToken?: string): Promise<ApiResponse<{ user: any }>> {
    const isFormData = data instanceof FormData;

    const options: any = {
      method: "PUT",
      cache: "no-store",
    };

    if (isFormData) {
      // Không set Content-Type cho FormData, browser sẽ tự động set
      options.body = data;
    } else {
      // Cho JSON data
      options.body = JSON.stringify(data);
    }

    return await apiFetch<ApiResponse<{ user: any }>>("/users/me", accessToken, options);
  }

  /**
   * Upload files lên server.
   * @param formData - FormData chứa files cần upload
   * @param accessToken - Token xác thực
   */
  async uploadFiles(formData: FormData, accessToken: string): Promise<{ message: string; filePaths: string[] }> {
    const options: RequestInit = {
      method: "POST",
      body: formData,
      cache: "no-store",
    };

    // Không set Content-Type để browser tự động set multipart/form-data với boundary
    // API upload trả về trực tiếp { message, filePaths }, không có cấu trúc ApiResponse
    return await apiFetch<{ message: string; filePaths: string[] }>("/upload", accessToken, options);
  }
}

export const userService = new UserService();
