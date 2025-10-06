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
  type: "earn" | "redeem" | "expire" | "adjust";
  points: number;
  description: string;
  orderId?: string;
  expiresAt?: string;
  status: "active" | "expired" | "used";
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
  expiringWithinDays: number;
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
    type: "earn" | "redeem" | "all" = "all",
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
   * Lấy danh sách giao dịch điểm tích lũy (endpoint mới)
   * @param accessToken - Token xác thực
   * @param type - Loại giao dịch: "earn" | "redeem" | "expire" | "adjust" | "all"
   * @param page - Trang hiện tại
   * @param limit - Số bản ghi mỗi trang
   */
  async getTransactions(
    accessToken: string,
    type: "earn" | "redeem" | "expire" | "adjust" | "all" = "all",
    page: number = 1,
    limit: number = 10
  ): Promise<LoyaltyTransactionsResponse> {
    if (!accessToken) {
      return {
        success: false,
        message: "Yêu cầu xác thực.",
        data: [],
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10,
      };
    }

    const queryParams = new URLSearchParams({
      type,
      page: page.toString(),
      limit: limit.toString(),
    });

    return await apiFetch<LoyaltyTransactionsResponse>(
      `/users/loyalty-transactions?${queryParams}`,
      accessToken,
      {
        method: "GET",
        cache: "no-store",
      }
    );
  }

  /**
   * Lấy thông tin điểm sắp hết hạn
   * @param accessToken - Token xác thực
   * @param days - Số ngày tới (mặc định 30)
   */
  async getExpiringPoints(
    accessToken: string,
    days: number = 30
  ): Promise<ApiResponse<ExpiringPointsData>> {
    if (!accessToken) {
      return {
        success: false,
        message: "Yêu cầu xác thực.",
        data: {
          totalExpiringPoints: 0,
          expiringWithinDays: 30,
          details: [],
        },
      };
    }

    const queryParams = new URLSearchParams({
      days: days.toString(),
    });

    return await apiFetch<ApiResponse<ExpiringPointsData>>(
      `/users/expiring-points?${queryParams}`,
      accessToken,
      {
        method: "GET",
        cache: "no-store",
      }
    );
  }
}

export const loyaltyService = new LoyaltyService();
