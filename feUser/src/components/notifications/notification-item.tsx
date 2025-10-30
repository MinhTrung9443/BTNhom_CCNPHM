"use client";

import { Notification } from "@/types/notification";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getNotificationLink = () => {
    // Nếu là thông báo bài viết
    if (notification.type === 'article' && notification.articleId) {
      let baseUrl = '';
      
      if (typeof notification.articleId === 'object' && notification.articleId.slug) {
        baseUrl = `/bai-viet/${notification.articleId.slug}`;
      } else if (typeof notification.articleId === 'string') {
        // Fallback nếu articleId chỉ là ID string
        baseUrl = `/bai-viet/${notification.articleId}`;
      }
      
      // Thêm query params cho highlight
      if (baseUrl && notification.subType && notification.referenceId) {
        const params = new URLSearchParams();
        params.set('highlight', notification.subType);
        params.set('commentId', notification.referenceId);
        return `${baseUrl}?${params.toString()}`;
      }
      
      return baseUrl;
    }
    // Nếu là thông báo đơn hàng
    if (notification.type === 'order') {
      // Điều hướng đến chi tiết đơn hàng nếu có referenceId
      if (notification.referenceId) {
        return `/don-hang/${notification.referenceId}`;
      }
      // Fallback về danh sách đơn hàng
      return `/don-hang`;
    }
    // Nếu là thông báo loyalty points
    if (notification.type === 'loyalty') {
      return `/don-hang`;
    }
    return "#";
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification._id);
    }
  };

  return (
    <div
      className={cn(
        "relative p-4 border-b hover:bg-muted/50 transition-colors",
        !notification.isRead && "bg-blue-50/50 dark:bg-blue-950/20"
      )}
    >
      <Link href={getNotificationLink()} onClick={handleClick}>
        <div className="pr-8">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-sm">{notification.title}</h4>
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {notification.message}
          </p>
          <span className="text-xs text-muted-foreground">
            {formatDate(notification.createdAt)}
          </span>
        </div>
      </Link>

      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-6 w-6 p-0"
        onClick={(e) => {
          e.preventDefault();
          onDelete(notification._id);
        }}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
