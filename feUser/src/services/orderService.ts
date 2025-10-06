// src/services/orderService.ts
import { apiFetch } from "@/lib/api";
import type { Order, OrdersResponse, GetOrdersParams, OrderPreviewRequest, OrderPreview, OrderStats, CreateOrderRequest } from "@/types/order";
import type { ApiResponse } from "@/types/api";

class OrderService {
  /**
   * Lấy dữ liệu xem trước đơn hàng từ server.
   * @param accessToken - Token xác thực của người dùng.
   * @param previewData - Dữ liệu các sản phẩm và tùy chọn.
   */
  async previewOrder(accessToken: string, previewData: OrderPreviewRequest): Promise<ApiResponse<{ previewOrder: OrderPreview }>> {
    return await apiFetch("/orders/preview", accessToken, {
      method: "POST",
      body: JSON.stringify(previewData),
      cache: "no-store",
    });
  }

  /**
   * Tạo đơn hàng cuối cùng.
   * @param accessToken - Token xác thực của người dùng.
   * @param orderData - Dữ liệu đơn hàng đã được xác nhận từ trang preview.
   */
  async createOrder(accessToken: string, orderData: CreateOrderRequest): Promise<ApiResponse<Order>> {
    return await apiFetch("/orders", accessToken, {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  /**
   * Tạo đơn hàng MoMo và chuyển hướng đến thanh toán.
   * @param accessToken - Token xác thực của người dùng.
   * @param orderData - Dữ liệu đơn hàng đã được xác nhận từ trang preview.
   */
  async createMomoOrder(accessToken: string, orderData: CreateOrderRequest): Promise<ApiResponse<{ payUrl: string; order: Order }>> {
    return await apiFetch("/orders/create-order-momo", accessToken, {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async getMyOrders(accessToken: string, params?: GetOrdersParams): Promise<OrdersResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);

    const response: OrdersResponse = await apiFetch(`/orders/my?${queryParams.toString()}`, accessToken);
    // Backend đã trả về cấu trúc OrdersResponse, có thể dùng trực tiếp
    return response;
  }

  async getOrderById(accessToken: string, orderId: string): Promise<ApiResponse<Order>> {
    const response: ApiResponse<Order> = await apiFetch(`/orders/${orderId}`, accessToken);
    return response;
  }

  async cancelOrder(accessToken: string, orderId: string, reason: string): Promise<ApiResponse<Order>> {
    const response: ApiResponse<Order> = await apiFetch(`/orders/my/${orderId}/cancel`, accessToken, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    });
    return response;
  }

  async getMyStats(accessToken: string): Promise<ApiResponse<OrderStats>> {
    const response: ApiResponse<OrderStats> = await apiFetch("/orders/my/stats", accessToken, {
      method: "GET",
      next: { revalidate: 300 }, // Cache 5 phút
    });
    return response;
  }

  async requestReturn(accessToken: string, orderId: string, reason: string): Promise<ApiResponse<Order>> {
    const response: ApiResponse<Order> = await apiFetch(`/orders/${orderId}/request-return`, accessToken, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
    return response;
  }

  async confirmReceived(accessToken: string, orderId: string): Promise<ApiResponse<Order>> {
    const response: ApiResponse<Order> = await apiFetch(`/orders/my/${orderId}/confirm-received`, accessToken, {
      method: "PATCH",
    });
    return response;
  }

  /**
   * Gọi API momo-return để cập nhật trạng thái thanh toán
   */
  async momoReturn(
    accessToken: string,
    data: {
      orderId: string;
      resultCode: string;
      amount?: string;
      transId?: string;
      message?: string;
    }
  ): Promise<ApiResponse<Order>> {
    const response: ApiResponse<Order> = await apiFetch("/orders/momo-return", accessToken, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Thanh toán lại đơn hàng MoMo bị pending hoặc failed
   */
  async retryMomoPayment(accessToken: string, orderId: string): Promise<ApiResponse<{ payUrl: string; order: Order }>> {
    const response: ApiResponse<{ payUrl: string; order: Order }> = await apiFetch(`/orders/my/${orderId}/retry-momo`, accessToken, {
      method: "POST",
    });
    return response;
  }
}

export const orderService = new OrderService();
