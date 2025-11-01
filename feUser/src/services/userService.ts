import { apiFetch } from "@/lib/api";
import { ApiResponse } from "@/types/api";
import { FavoriteProduct, FavoritesResponse, ToggleFavoriteResponse } from "@/types/favorite";
import { UserLoyaltyPoints } from "@/types/user";

class UserService {
  /**
   * Lấy danh sách sản phẩm yêu thích của người dùng với phân trang và tìm kiếm.
   * @param accessToken - Bắt buộc, vì đây là endpoint cần xác thực.
   * @param page - Số trang (default: 1)
   * @param limit - Số items mỗi trang (default: 10)
   * @param search - Từ khóa tìm kiếm (optional)
   */
  async getFavorites(
    accessToken: string, 
    page: number = 1, 
    limit: number = 10, 
    search?: string
  ): Promise<ApiResponse<FavoriteProduct[]> & {
    pagination?: {
      current: number;
      limit: number;
      total: number;
      totalItems: number;
    };
  }> {
    if (!accessToken) {
      return {
        success: false,
        message: "Yêu cầu xác thực.",
        data: [],
      };
    }

    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    if (search) {
      queryParams.append("search", search);
    }

    const response = await apiFetch(`/users/favorites?${queryParams.toString()}`, accessToken, {
      method: "GET",
      cache: "no-store",
    });

    return response as ApiResponse<FavoriteProduct[]> & {
      pagination?: {
        current: number;
        limit: number;
        total: number;
        totalItems: number;
      };
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

  /**
   * Lấy điểm tích lũy hiện có của người dùng.
   * @param accessToken - Bắt buộc, vì đây là endpoint cần xác thực.
   */
  async getLoyaltyPoints(accessToken: string): Promise<ApiResponse<UserLoyaltyPoints>> {
    if (!accessToken) {
      return {
        success: false,
        message: "Yêu cầu xác thực.",
        data: { loyaltyPoints: 0 },
      };
    }
    // API trả về cấu trúc ApiResponse<T> chuẩn
    return await apiFetch<ApiResponse<UserLoyaltyPoints>>("/users/me/loyalty-points", accessToken, {
      method: "GET",
      cache: "no-store", // Không cache điểm để luôn cập nhật
    });
  }

  async dailyCheckin(accessToken: string): Promise<ApiResponse<{
    points: number;
    totalPoints: number;
    expiryDate: string;
    nextCheckinDate: string;
  }>> {
    if (!accessToken) {
      return {
        success: false,
        message: "Yêu cầu xác thực.",
        data: { points: 0, totalPoints: 0, expiryDate: '', nextCheckinDate: '' },
      };
    }
    return await apiFetch("/users/daily-checkin", accessToken, {
      method: "POST",
      cache: "no-store",
    });
  }

  /**
   * Lấy trạng thái điểm danh của người dùng.
   * @param accessToken - Bắt buộc, vì đây là endpoint cần xác thực.
   */
  async getCheckinStatus(accessToken: string): Promise<ApiResponse<{
    canCheckin: boolean;
    lastCheckinDate: string | null;
    nextCheckinDate: string;
  }>> {
    if (!accessToken) {
      return {
        success: false,
        message: "Yêu cầu xác thực.",
        data: { canCheckin: false, lastCheckinDate: null, nextCheckinDate: '' },
      };
    }
    return await apiFetch("/users/checkin-status", accessToken, {
      method: "GET",
      cache: "no-store",
    });
  }

  // === ADDRESS MANAGEMENT METHODS ===

  /**
   * Lấy danh sách địa chỉ của người dùng
   */
  async getAddresses(accessToken: string): Promise<ApiResponse<Address[]>> {
    if (!accessToken) {
      return {
        success: false,
        message: "Yêu cầu xác thực.",
        data: [],
      };
    }
    return await apiFetch("/users/me/addresses", accessToken, {
      method: "GET",
      cache: "no-store",
    });
  }

  /**
   * Thêm địa chỉ mới
   */
  async addAddress(accessToken: string, addressData: {
    recipientName: string;
    phoneNumber: string;
    street: string;
    ward: string;
    district: string;
    province: string;
    isDefault?: boolean;
  }): Promise<ApiResponse<Address>> {
    if (!accessToken) {
      return {
        success: false,
        message: "Yêu cầu xác thực.",
        data: {} as Address,
      };
    }
    return await apiFetch("/users/me/addresses", accessToken, {
      method: "POST",
      body: JSON.stringify(addressData),
      cache: "no-store",
    });
  }

  /**
   * Cập nhật địa chỉ
   */
  async updateAddress(accessToken: string, addressId: string, addressData: {
    recipientName: string;
    phoneNumber: string;
    street: string;
    ward: string;
    district: string;
    province: string;
    isDefault?: boolean;
  }): Promise<ApiResponse<Address>> {
    if (!accessToken) {
      return {
        success: false,
        message: "Yêu cầu xác thực.",
        data: {} as Address,
      };
    }
    return await apiFetch(`/users/me/addresses/${addressId}`, accessToken, {
      method: "PUT",
      body: JSON.stringify(addressData),
      cache: "no-store",
    });
  }

  /**
   * Xóa địa chỉ
   */
  async deleteAddress(accessToken: string, addressId: string): Promise<ApiResponse<void>> {
    if (!accessToken) {
      return {
        success: false,
        message: "Yêu cầu xác thực.",
        data: undefined,
      };
    }
    return await apiFetch(`/users/me/addresses/${addressId}`, accessToken, {
      method: "DELETE",
      cache: "no-store",
    });
  }

  /**
   * Đặt địa chỉ làm mặc định
   */
  async setDefaultAddress(accessToken: string, addressId: string): Promise<ApiResponse<Address>> {
    if (!accessToken) {
      return {
        success: false,
        message: "Yêu cầu xác thực.",
        data: {} as Address,
      };
    }
    return await apiFetch(`/users/me/addresses/${addressId}/default`, accessToken, {
      method: "PATCH",
      cache: "no-store",
    });
  }

  /**
   * Lấy địa chỉ mặc định
   */
  async getDefaultAddress(accessToken: string): Promise<ApiResponse<Address | null>> {
    if (!accessToken) {
      return {
        success: false,
        message: "Yêu cầu xác thực.",
        data: null,
      };
    }
    return await apiFetch("/users/me/addresses/default", accessToken, {
      method: "GET",
      cache: "no-store",
    });
  }
}

// Import Address type
import { Address } from "@/types/user";

export const userService = new UserService();
