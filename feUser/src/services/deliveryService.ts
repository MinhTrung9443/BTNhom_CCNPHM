// src/services/deliveryService.ts
import { apiFetch } from '@/lib/api';
import type { DeliveryMethod } from '@/types/delivery';
import type { ApiResponse } from '@/types/api';

class DeliveryService {
  /**
   * Lấy danh sách phương thức giao hàng
   * @param accessToken - Token xác thực của người dùng
   */
  async getDeliveryMethods(accessToken: string): Promise<ApiResponse<DeliveryMethod[]>> {
    return await apiFetch('/payments/get-delivery', accessToken, {
      method: 'POST',
      next: { revalidate: 3600 } // Cache 1 giờ vì data ít thay đổi
    });
  }
}

export const deliveryService = new DeliveryService();
