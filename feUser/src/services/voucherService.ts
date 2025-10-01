// src/services/voucherService.ts
import { apiFetch } from '@/lib/api';
import type { Voucher, ApplicableVouchersRequest } from '@/types/voucher';
import type { ApiResponse } from '@/types/api';

class VoucherService {
  /**
   * Lấy danh sách voucher có thể áp dụng cho đơn hàng
   * @param accessToken - Token xác thực của người dùng
   * @param requestData - Danh sách sản phẩm trong đơn hàng
   */
  async getApplicableVouchers(
    accessToken: string, 
    requestData: ApplicableVouchersRequest
  ): Promise<ApiResponse<Voucher[]>> {
    return await apiFetch('/vouchers/applicable-vouchers', accessToken, {
      method: 'POST',
      body: JSON.stringify(requestData),
      cache: 'no-store', // Không cache vì voucher có thể hết hạn hoặc hết lượt
    });
  }
}

export const voucherService = new VoucherService();
