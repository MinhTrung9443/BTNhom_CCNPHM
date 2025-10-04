"use client";

import { memo } from "react";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";

interface UserInfoProps {
  variant?: "desktop" | "mobile";
  className?: string;
  session?: Session | null; // ✅ Nhận session từ parent
}

/**
 * Component hiển thị thông tin user (name, email)
 * Được tối ưu với React.memo để tránh re-render không cần thiết
 */
function UserInfoComponent({ variant = "desktop", className = "", session: sessionProp }: UserInfoProps) {
  // ✅ Ưu tiên dùng session từ prop
  const { data: sessionFromHook } = useSession();
  const session = sessionProp ?? sessionFromHook;

  const user = {
    name: session?.user?.name ?? "User",
    email: session?.user?.email ?? "",
  };

  if (variant === "mobile") {
    return (
      <div className={className}>
        <p className="text-sm font-medium">{user.name}</p>
        <p className="text-xs text-gray-500">{user.email}</p>
      </div>
    );
  }

  // Desktop variant (for dropdown)
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <p className="text-sm font-medium leading-none">{user.name}</p>
      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
    </div>
  );
}

/**
 * Exported với React.memo
 * Chỉ re-render khi name hoặc email thay đổi (hiếm khi)
 */
export const UserInfo = memo(UserInfoComponent);

UserInfo.displayName = "UserInfo";
