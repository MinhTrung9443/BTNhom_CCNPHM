"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { viewHistoryService } from "@/services/viewHistoryService";

interface ViewHistoryTrackerProps {
  productId: string;
}

export function ViewHistoryTracker({ productId }: ViewHistoryTrackerProps) {
  const { data: session } = useSession();

  useEffect(() => {
    const addToViewHistory = async () => {
      if (session?.user?.accessToken && productId) {
        try {
          await viewHistoryService.addViewHistory(productId, session.user.accessToken);
        } catch (error) {
          // Silently fail - không cần hiển thị lỗi cho user
          console.log("Could not add to view history:", error);
        }
      }
    };

    // Thêm vào lịch sử xem sau một chút để đảm bảo component đã mount
    const timer = setTimeout(() => {
      addToViewHistory();
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [productId, session?.user?.accessToken]);

  // Component này không render gì
  return null;
}
