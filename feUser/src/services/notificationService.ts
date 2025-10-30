import { apiFetch } from "@/lib/api";
import { ApiResponse } from "@/types/api";
import { Notification, NotificationListResponse } from "@/types/notification";

class NotificationService {
  /**
   * Lấy danh sách thông báo
   */
  async getNotifications(
    page: number = 1,
    limit: number = 20,
    accessToken: string
  ): Promise<ApiResponse<{ notifications: Notification[]; unreadCount: number; pagination: any }>> {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    return await apiFetch<ApiResponse<{ notifications: Notification[]; unreadCount: number; pagination: any }>>(
      `/v1/notifications?${searchParams.toString()}`,
      accessToken
    );
  }

  /**
   * Đánh dấu thông báo đã đọc
   */
  async markAsRead(
    notificationId: string,
    accessToken: string
  ): Promise<ApiResponse<Notification>> {
    return await apiFetch<ApiResponse<Notification>>(
      `/v1/notifications/${notificationId}/read`,
      accessToken,
      { method: "PATCH" }
    );
  }

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  async markAllAsRead(
    accessToken: string
  ): Promise<ApiResponse<null>> {
    return await apiFetch<ApiResponse<null>>(
      `/v1/notifications/mark-all-read`,
      accessToken,
      { method: "PATCH" }
    );
  }

  /**
   * Xóa thông báo
   */
  async deleteNotification(
    notificationId: string,
    accessToken: string
  ): Promise<ApiResponse<null>> {
    return await apiFetch<ApiResponse<null>>(
      `/v1/notifications/${notificationId}`,
      accessToken,
      { method: "DELETE" }
    );
  }

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  async getUnreadCount(
    accessToken: string
  ): Promise<ApiResponse<{ unreadCount: number }>> {
    return await apiFetch<ApiResponse<{ unreadCount: number }>>(
      `/v1/notifications/unread-count`,
      accessToken
    );
  }
}

export const notificationService = new NotificationService();
