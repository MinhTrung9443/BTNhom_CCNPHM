import { apiFetch } from "@/lib/api";
import { ApiResponse } from "@/types/api";

export interface LoyaltyBalance {
  currentPoints: number;
  pointsExpiringThisMonth: number;
  expirationDate: string;
}

export interface LoyaltyTransaction {
  _id: string;
  userId: string;
  transactionType: "earned" | "redeemed" | "expired" | "bonus" | "refund";
  points: number;
  description: string;
  orderId?: {
    _id: string;
    orderNumber: string;
    totalAmount: number;
  };
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyHistoryResponse extends ApiResponse<LoyaltyTransaction[]> {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
}

export interface LoyaltyTransactionsResponse extends ApiResponse<LoyaltyTransaction[]> {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ExpiringPointDetail {
  points: number;
  expiryDate: string;
  daysRemaining: number;
  description: string;
  earnedDate: string;
}

export interface ExpiringPointsData {
  totalExpiringPoints: number;
  expirationDate: string;
  details: ExpiringPointDetail[];
}

class LoyaltyService {
  /**
   * Lấy số dư điểm tích lũy hiện tại
   * @param accessToken - Token xác thực
   */
  async getBalance(accessToken: string): Promise<ApiResponse<LoyaltyBalance>> {
    if (!accessToken) {
      return {
        success: false,
        message: "Yêu cầu xác thực.",
        data: {
          currentPoints: 0,
          pointsExpiringThisMonth: 0,
          expirationDate: new Date().toISOString(),
        },
      };
    }

    return await apiFetch<ApiResponse<LoyaltyBalance>>("/loyalty/balance", accessToken, {
      method: "GET",
      cache: "no-store",
    });
  }

  /**
   * Lấy lịch sử giao dịch điểm tích lũy
   * @param accessToken - Token xác thực
   * @param type - Loại giao dịch: "earn" | "redeem" | "all"
   * @param page - Trang hiện tại
   * @param limit - Số bản ghi mỗi trang
   */
  async getHistory(
    accessToken: string,
    type: "all" | "earned" | "redeemed" | "expired" = "all",
    page: number = 1,
    limit: number = 10
  ): Promise<LoyaltyHistoryResponse> {
    if (!accessToken) {
      return {
        success: false,
        message: "Yêu cầu xác thực.",
        data: [],
        currentPage: 1,
        totalPages: 0,
        totalRecords: 0,
        limit: 10,
      };
    }

    const queryParams = new URLSearchParams({
      type,
      page: page.toString(),
      limit: limit.toString(),
    });

    return await apiFetch<LoyaltyHistoryResponse>(`/loyalty/history?${queryParams}`, accessToken, {
      method: "GET",
      cache: "no-store",
    });
  }

  /**
   * Lấy danh sách giao dịch điểm tích lũy (endpoint mới) - DEPRECATED: Use getHistory
   * @param accessToken - Token xác thực
   * @param type - Loại giao dịch: "all" | "earned" | "redeemed" | "expired"
   * @param page - Trang hiện tại
   * @param limit - Số bản ghi mỗi trang
   */
  async getTransactions(
    accessToken: string,
    type: "all" | "earned" | "redeemed" | "expired" = "all",
    page: number = 1,
    limit: number = 10
  ): Promise<LoyaltyHistoryResponse> {
    // This function now calls getHistory to ensure consistency.
    return this.getHistory(accessToken, type, page, limit);
  }

  /**
   * Lấy thông tin điểm sắp hết hạn
   * @param accessToken - Token xác thực
   * @param days - Số ngày tới (mặc định 30)
   */
  async getExpiringPoints(
    accessToken: string
  ): Promise<ApiResponse<ExpiringPointsData>> {
    if (!accessToken) {
      return {
        success: false,
        message: "Yêu cầu xác thực.",
        data: {
          totalExpiringPoints: 0,
          expirationDate: new Date().toISOString(),
          details: [],
        },
      };
    }

    return await apiFetch<ApiResponse<ExpiringPointsData>>(
      `/users/expiring-points`,
      accessToken,
      {
        method: "GET",
        cache: "no-store",
      }
    );
  }
}

export const loyaltyService = new LoyaltyService();
