"use client";

import { useRouter } from "next/navigation";
import { CancelOrderDialog } from "@/components/cancel-order-dialog";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import type { OrderStatus } from "@/types/order";

interface OrderDetailClientProps {
  orderId: string;
  canCancel: boolean;
  orderStatus: OrderStatus;
}

export function OrderDetailClient({ orderId, canCancel, orderStatus }: OrderDetailClientProps) {
  const router = useRouter();

  const handleCancelSuccess = () => {
    router.refresh();
  };

  // Nếu đơn hàng đang chờ xử lý yêu cầu hủy
  if (orderStatus === "cancellation_requested") {
    return (
      <Button variant="outline" size="sm" disabled className="cursor-not-allowed opacity-60">
        <Clock className="mr-2 h-4 w-4 animate-pulse" />
        Đang xử lý yêu cầu hủy
      </Button>
    );
  }

  // Nếu không thể hủy
  if (!canCancel) {
    return null;
  }

  // Hiển thị nút hủy bình thường
  return <CancelOrderDialog orderId={orderId} onSuccess={handleCancelSuccess} />;
}