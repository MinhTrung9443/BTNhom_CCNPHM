"use client";

import { useRouter } from "next/navigation";
import { CancelOrderDialog } from "@/components/cancel-order-dialog";
import { ReturnOrderDialog } from "@/components/return-order-dialog";
import { ConfirmReceivedDialog } from "@/components/confirm-received-dialog";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import type { OrderStatus, DetailedOrderStatus } from "@/types/order";

interface OrderDetailClientProps {
  orderId: string;
  canCancel: boolean;
  canReturn: boolean;
  canConfirmReceived: boolean;
  orderStatus: OrderStatus;
  latestDetailedStatus?: DetailedOrderStatus;
}

export function OrderDetailClient({ 
  orderId, 
  canCancel, 
  canReturn,
  canConfirmReceived,
  latestDetailedStatus 
}: OrderDetailClientProps) {
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh();
  };

  // Nếu đơn hàng đang chờ xử lý yêu cầu hủy
  if (latestDetailedStatus === "cancellation_requested") {
    return (
      <Button variant="outline" size="sm" disabled className="cursor-not-allowed opacity-60">
        <Clock className="mr-2 h-4 w-4 animate-pulse" />
        Đang xử lý yêu cầu hủy
      </Button>
    );
  }

  // Nếu đơn hàng đang chờ xử lý yêu cầu trả hàng
  if (latestDetailedStatus === "return_requested") {
    return (
      <Button variant="outline" size="sm" disabled className="cursor-not-allowed opacity-60">
        <Clock className="mr-2 h-4 w-4 animate-pulse" />
        Đang xử lý yêu cầu trả hàng
      </Button>
    );
  }

  // Hiển thị các nút action
  return (
    <div className="flex gap-2">
      {canCancel && (
        <CancelOrderDialog orderId={orderId} onSuccess={handleSuccess} />
      )}
      {canConfirmReceived && (
        <ConfirmReceivedDialog orderId={orderId} onSuccess={handleSuccess} />
      )}
      {canReturn && (
        <ReturnOrderDialog orderId={orderId} onSuccess={handleSuccess} />
      )}
    </div>
  );
}