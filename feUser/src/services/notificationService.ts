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
  ): Promise<ApiResponse<{ meta: NotificationListResponse; data: Notification[] }>> {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    return await apiFetch<ApiResponse<{ meta: NotificationListResponse; data: Notification[] }>>(
      `/notifications?${searchParams.toString()}`,
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
      `/notifications/${notificationId}/read`,
      accessToken,
      { method: "PUT" }
    );
  }

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  async markAllAsRead(
    accessToken: string
  ): Promise<ApiResponse<{ modifiedCount: number }>> {
    return await apiFetch<ApiResponse<{ modifiedCount: number }>>(
      `/notifications/read-all`,
      accessToken,
      { method: "PUT" }
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
      `/notifications/${notificationId}`,
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
      `/notifications/unread-count`,
      accessToken
    );
  }
}

export const notificationService = new NotificationService();
