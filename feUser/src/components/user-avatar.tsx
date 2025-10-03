"use client";

import { memo, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Session } from "next-auth";

interface UserAvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  session?: Session | null; // ✅ Nhận session từ parent để tránh re-fetch
}

/**
 * Component Avatar được tối ưu với React.memo
 * Chỉ re-render khi avatar thay đổi, không ảnh hưởng đến các component khác
 */
function UserAvatarComponent({ size = "md", className = "", session: sessionProp }: UserAvatarProps) {
  // ✅ Ưu tiên dùng session từ prop, fallback về useSession nếu không có
  const { data: sessionFromHook } = useSession();
  const session = sessionProp ?? sessionFromHook;
  
  const [avatarTimestamp, setAvatarTimestamp] = useState<number>(Date.now());

  const user = {
    name: session?.user?.name ?? "User",
    avatar: session?.user?.avatar ?? "",
  };

  // Chỉ cập nhật timestamp khi avatar thực sự thay đổi
  useEffect(() => {
    if (session?.user?.avatar) {
      setAvatarTimestamp(Date.now());
    }
  }, [session?.user?.avatar]);

  // Xác định kích thước
  const sizeClass = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }[size];

  // Xử lý avatar URL: nếu đã là HTTP thì giữ nguyên, nếu không thì concat với base URL
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "http://localhost:5000";
  const avatarUrl = user.avatar
    ? user.avatar.startsWith('http')
      ? `${user.avatar}?t=${avatarTimestamp}`
      : `${baseUrl}${user.avatar}?t=${avatarTimestamp}`
    : "";

  // ✅ Nếu có avatar URL, preload ảnh
  useEffect(() => {
    if (avatarUrl) {
      const img = new Image();
      img.src = avatarUrl;
    }
  }, [avatarUrl]);

  return (
    <Avatar className={`${sizeClass} ${className}`} key={user.avatar}>
      {avatarUrl ? (
        <AvatarImage src={avatarUrl} alt={user.name} className="object-cover" />
      ) : null}
      <AvatarFallback className="bg-green-600 text-white" delayMs={avatarUrl ? 300 : 0}>
        {user.name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

/**
 * Exported với React.memo để ngăn re-render không cần thiết
 * Component chỉ re-render khi props thay đổi
 */
export const UserAvatar = memo(UserAvatarComponent, (prevProps, nextProps) => {
  // So sánh props để quyết định có cần re-render không
  return (
    prevProps.size === nextProps.size &&
    prevProps.className === nextProps.className &&
    prevProps.session?.user?.avatar === nextProps.session?.user?.avatar
  );
});

UserAvatar.displayName = "UserAvatar";
