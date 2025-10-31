// src/services/voucherService.ts
import { apiFetch } from "@/lib/api";
import type { Voucher, ApplicableVouchersRequest } from "@/types/voucher";
import type { ApiResponse } from "@/types/api";

export interface PublicVoucher extends Voucher {
  isClaimed: boolean;
  availableSlots: number | null;
  usageCount: number;
  remainingUsage: number | null;
}

export interface UserVoucher {
  _id: string;
  userId: string;
  voucherId: string;
  isUsed: boolean;
  usageCount: number;
  remainingUsage: number | null;
  orderId?: {
    _id: string;
    orderNumber: string;
  };
  voucher: Voucher;
  status: "available" | "used" | "expired" | "upcoming" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface VoucherListResponse {
  success: boolean;
  message: string;
  data: {
    vouchers: PublicVoucher[] | UserVoucher[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

class VoucherService {
  /**
   * Lấy danh sách voucher có thể áp dụng cho đơn hàng
   * @param accessToken - Token xác thực của người dùng
   * @param requestData - Danh sách sản phẩm trong đơn hàng
   */
  async getApplicableVouchers(accessToken: string, requestData: ApplicableVouchersRequest): Promise<ApiResponse<Voucher[]>> {
    return await apiFetch("/vouchers/applicable-vouchers", accessToken, {
      method: "POST",
      body: JSON.stringify(requestData),
      cache: "no-store", // Không cache vì voucher có thể hết hạn hoặc hết lượt
    });
  }

  // Lấy danh sách voucher công khai có thể claim
  async getPublicVouchers(page: number = 1, limit: number = 10, accessToken: string): Promise<VoucherListResponse> {
    try {
      const result = (await apiFetch(`/vouchers/public?page=${page}&limit=${limit}`, accessToken, {
        method: "GET",
      })) as { success: boolean; message: string; data: any };

      return {
        success: true,
        message: "Lấy danh sách voucher thành công",
        data: result.data,
      };
    } catch (error: any) {
      console.error("Get public vouchers error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Không thể lấy danh sách voucher",
        data: {
          vouchers: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
      };
    }
  }

  // Lấy danh sách voucher sắp mở
  async getUpcomingVouchers(page: number = 1, limit: number = 10): Promise<VoucherListResponse> {
    try {
      const result = (await apiFetch(`/vouchers/upcoming?page=${page}&limit=${limit}`, undefined, {
        method: "GET",
      })) as { success: boolean; message: string; data: any };

      return {
        success: true,
        message: "Lấy danh sách voucher sắp mở thành công",
        data: result.data,
      };
    } catch (error: any) {
      console.error("Get upcoming vouchers error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Không thể lấy danh sách voucher sắp mở",
        data: {
          vouchers: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
      };
    }
  }

  // Lấy danh sách voucher của user
  async getUserVouchers(page: number = 1, limit: number = 10, accessToken: string): Promise<VoucherListResponse> {
    try {
      const result = (await apiFetch(`/vouchers/my?page=${page}&limit=${limit}`, accessToken, {
        method: "GET",
      })) as { success: boolean; message: string; data: any };

      return {
        success: true,
        message: "Lấy danh sách voucher của bạn thành công",
        data: result.data,
      };
    } catch (error: any) {
      console.error("Get user vouchers error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Không thể lấy danh sách voucher của bạn",
        data: {
          vouchers: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
      };
    }
  }

  // Claim voucher
  async claimVoucher(voucherId: string, accessToken: string): Promise<ApiResponse<Voucher | null>> {
    try {
      const result = (await apiFetch(`/vouchers/claim/${voucherId}`, accessToken, {
        method: "POST",
      })) as ApiResponse<Voucher>;

      return result;
    } catch (error: any) {
      console.error("Claim voucher error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Không thể lưu voucher",
        data: null,
      };
    }
  }
}

export const voucherService = new VoucherService();
