import { apiFetch } from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { FavoriteProduct, FavoritesResponse, ToggleFavoriteResponse } from '@/types/favorite';

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
        message: 'Yêu cầu xác thực.',
        data: [],
      };
    }

    // API này có cấu trúc response đặc biệt, cần được chuẩn hóa
    const rawResponse: FavoritesResponse = await apiFetch('/users/favorites', accessToken, {
      method: 'GET',
      cache: 'no-store', // Không cache danh sách yêu thích để luôn cập nhật
    });

    // Chuẩn hóa response về dạng ApiResponse<T>
    return {
      success: true,
      message: 'Lấy danh sách yêu thích thành công.',
      data: rawResponse.favorites || [],
    };
  }

  /**
   * Thêm hoặc xóa một sản phẩm khỏi danh sách yêu thích.
   * @param productId - ID của sản phẩm để toggle.
   * @param accessToken - Bắt buộc, vì đây là endpoint cần xác thực.
   */
  async toggleFavorite(
    productId: string,
    accessToken: string
  ): Promise<ApiResponse<{ favorited: boolean }>> {
     if (!accessToken) {
      return {
        success: false,
        message: 'Yêu cầu xác thực.',
        data: { favorited: false },
      };
    }
    
    const rawResponse: ToggleFavoriteResponse = await apiFetch(
      `/users/favorites/${productId}`,
      accessToken,
      {
        method: 'POST',
        cache: 'no-store',
      }
    );

    // Chuẩn hóa response về dạng ApiResponse<T>
    return {
      success: true,
      message: rawResponse.message,
      data: {
        favorited: rawResponse.favorited,
      },
    };
  }
}

export const userService = new UserService();