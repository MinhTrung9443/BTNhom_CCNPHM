import { apiFetch } from "@/lib/api";
import { ApiResponse } from "@/types/api";

export interface ViewHistoryItem {
  _id: string;
  userId: string;
  productId: {
    _id: string;
    slug: string;
    name: string;
    price: number;
    images: string[];
    discount?: number;
  };
  viewedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ViewHistoryResponse {
  success: boolean;
  data: {
    viewHistory: ViewHistoryItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

class ViewHistoryService {
  /**
   * Thêm sản phẩm vào lịch sử xem
   * @param productId - ID của sản phẩm
   * @param accessToken - Token xác thực
   */
  async addViewHistory(productId: string, accessToken: string): Promise<ApiResponse<ViewHistoryItem | null>> {
    if (!accessToken) {
      return {
        success: false,
        message: "Yêu cầu xác thực.",
        data: null,
      };
    }

    try {
      const response = (await apiFetch(`/view-history/${productId}`, accessToken, {
        method: "POST",
      })) as ApiResponse<ViewHistoryItem>;

      return response;
    } catch (error) {
      console.error("Error adding to view history:", error);
      return {
        success: false,
        message: "Không thể thêm vào lịch sử xem.",
        data: null,
      };
    }
  }

  /**
   * Lấy lịch sử xem với phân trang
   * @param accessToken - Token xác thực
   * @param page - Trang hiện tại
   * @param limit - Số lượng items per page
   */
  async getViewHistory(
    accessToken: string,
    page: number = 1,
    limit: number = 10
  ): Promise<
    ApiResponse<{
      viewHistory: ViewHistoryItem[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>
  > {
    if (!accessToken) {
      return {
        success: false,
        message: "Yêu cầu xác thực.",
        data: {
          viewHistory: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
      };
    }

    try {
      const response: ViewHistoryResponse = await apiFetch(`/view-history?page=${page}&limit=${limit}`, accessToken, {
        method: "GET",
        cache: "no-store",
      });

      return {
        success: response.success,
        message: "Lấy lịch sử xem thành công.",
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching view history:", error);
      return {
        success: false,
        message: "Không thể lấy lịch sử xem.",
        data: {
          viewHistory: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
      };
    }
  }

  /**
   * Xóa một item khỏi lịch sử xem
   * @param historyId - ID của history item
   * @param accessToken - Token xác thực
   */
  async removeViewHistory(historyId: string, accessToken: string): Promise<ApiResponse<null>> {
    if (!accessToken) {
      return {
        success: false,
        message: "Yêu cầu xác thực.",
        data: null,
      };
    }

    try {
      const response = (await apiFetch(`/view-history/${historyId}`, accessToken, {
        method: "DELETE",
      })) as ApiResponse<null>;

      return response;
    } catch (error) {
      console.error("Error removing view history item:", error);
      return {
        success: false,
        message: "Không thể xóa khỏi lịch sử xem.",
        data: null,
      };
    }
  }

  /**
   * Xóa toàn bộ lịch sử xem
   * @param accessToken - Token xác thực
   */
  async clearViewHistory(accessToken: string): Promise<ApiResponse<null>> {
    if (!accessToken) {
      return {
        success: false,
        message: "Yêu cầu xác thực.",
        data: null,
      };
    }

    try {
      const response = (await apiFetch("/view-history", accessToken, {
        method: "DELETE",
      })) as ApiResponse<null>;

      return response;
    } catch (error) {
      console.error("Error clearing view history:", error);
      return {
        success: false,
        message: "Không thể xóa lịch sử xem.",
        data: null,
      };
    }
  }
}

export const viewHistoryService = new ViewHistoryService();
