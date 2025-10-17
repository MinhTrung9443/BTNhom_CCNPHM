import { useState, useEffect, useCallback } from "react";
import { notificationService } from "@/services/notificationService";
import { Notification } from "@/types/notification";
import { useSession } from "next-auth/react";
import { useSocket } from "./useSocket";

export function useNotifications() {
  const { data: session } = useSession();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (!session?.accessToken) return;

      try {
        setLoading(true);
        setError(null);

        const response = await notificationService.getNotifications(
          pageNum,
          20,
          session.accessToken
        );

        if (response.success && response.data) {
          const newNotifications = response.data.data;
          setNotifications((prev) =>
            append ? [...prev, ...newNotifications] : newNotifications
          );
          setUnreadCount(response.data.meta.unreadCount);
          setHasMore(
            response.data.meta.currentPage < response.data.meta.totalPages
          );
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Không thể tải thông báo");
      } finally {
        setLoading(false);
      }
    },
    [session?.accessToken]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage, true);
    }
  }, [loading, hasMore, page, fetchNotifications]);

  const refresh = useCallback(() => {
    setPage(1);
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!session?.accessToken) return;

      try {
        await notificationService.markAsRead(
          notificationId,
          session.accessToken
        );

        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notificationId ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err: any) {
        console.error("Failed to mark notification as read:", err);
      }
    },
    [session?.accessToken]
  );

  const markAllAsRead = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      await notificationService.markAllAsRead(session.accessToken);
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, [session?.accessToken]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!session?.accessToken) return;

      try {
        await notificationService.deleteNotification(
          notificationId,
          session.accessToken
        );

        setNotifications((prev) => {
          const notification = prev.find((n) => n._id === notificationId);
          if (notification && !notification.read) {
            setUnreadCount((count) => Math.max(0, count - 1));
          }
          return prev.filter((notif) => notif._id !== notificationId);
        });
      } catch (err: any) {
        console.error("Failed to delete notification:", err);
      }
    },
    [session?.accessToken]
  );

  // Listen for real-time notifications via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("notification", handleNewNotification);

    return () => {
      socket.off("notification", handleNewNotification);
    };
  }, [socket]);

  // Initial fetch
  useEffect(() => {
    if (session?.accessToken) {
      fetchNotifications(1, false);
    }
  }, [session?.accessToken]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
