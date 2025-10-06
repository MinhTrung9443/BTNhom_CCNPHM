/**
 * Order Card Component
 * Component hiển thị thông tin đơn hàng dạng card chuyên nghiệp
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { CancelOrderDialog } from "@/components/cancel-order-dialog";
import { ReturnOrderDialog } from "@/components/return-order-dialog";
import { ConfirmReceivedDialog } from "@/components/confirm-received-dialog";
import { RetryPaymentDialog } from "@/components/retry-payment-dialog";
import type { Order } from "@/types/order";
import { Package, ChevronRight, Clock } from "lucide-react";

interface OrderCardProps {
  order: Order;
  onOrderUpdate?: () => void;
}

export function OrderCard({ order, onOrderUpdate }: OrderCardProps) {
  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  // Lấy trạng thái mới nhất từ timeline
  const getLatestStatus = () => {
    if (!order.timeline || order.timeline.length === 0) {
      return {
        status: order.status,
        description: "Đơn hàng đang được xử lý",
        timestamp: order.createdAt,
      };
    }

    // Timeline đã được sắp xếp theo thời gian, lấy phần tử cuối cùng
    const latest = order.timeline[order.timeline.length - 1];
    return {
      status: latest.status,
      description: latest.description,
      timestamp: latest.timestamp,
    };
  };

  const latestStatus = getLatestStatus();
  const displayProducts = order.orderLines.slice(0, 2);
  const remainingCount = order.orderLines.length - 2;

  // Kiểm tra có thể hủy đơn không theo logic backend:
  // - PENDING (detailed: new) → Có thể hủy trực tiếp
  // - PROCESSING (detailed: confirmed) → Có thể hủy trực tiếp
  // - PROCESSING (detailed: preparing) → Có thể yêu cầu hủy (chờ admin)
  // - SHIPPING trở đi → Không thể hủy
  const getLatestDetailedStatus = () => {
    if (!order.timeline || order.timeline.length === 0) return null;
    return order.timeline[order.timeline.length - 1]?.status;
  };

  const latestDetailedStatus = getLatestDetailedStatus();

  const canCancelOrder =
    order.status === "pending" || (order.status === "processing" && ["confirmed", "preparing"].includes(latestDetailedStatus || ""));

  // Kiểm tra có thể xác nhận đã nhận hàng không:
  // - Status chung phải là 'shipping'
  // - Status chi tiết mới nhất phải là 'delivered'
  const canConfirmReceived = order.status === "shipping" && latestDetailedStatus === "delivered";

  // Kiểm tra có thể yêu cầu trả hàng không:
  // - Status chung phải là 'shipping'
  // - Status chi tiết mới nhất phải là 'delivered'
  const canRequestReturn = order.status === "shipping" && latestDetailedStatus === "delivered";

  // Kiểm tra có thể thanh toán lại không:
  // - Phương thức thanh toán là MoMo
  // - Trạng thái thanh toán là pending hoặc failed
  // - Đơn hàng chưa hoàn tất hoặc bị hủy
  const canRetryPayment =
    order.payment.paymentMethod === "MOMO" &&
    ["pending", "failed"].includes(order.payment.status) &&
    !["cancelled", "completed", "return_refund"].includes(order.status);

  return (
    <Card className="hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Header với trạng thái nổi bật */}
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-b space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-base">#{order._id.slice(-8).toUpperCase()}</h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        {/* Description nổi bật */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-md px-3 py-2">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 leading-tight">{latestStatus.description}</p>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Danh sách sản phẩm - Compact */}
        <div className="space-y-2">
          {displayProducts.map((item, index) => (
            <div key={index} className="flex gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors">
              <div className="relative w-14 h-14 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 border">
                <Image src={item.productImage} alt={item.productName} fill unoptimized className="object-cover" sizes="56px" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <h4 className="font-medium text-sm line-clamp-2 leading-tight">{item.productName}</h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">SL: {item.quantity}</span>
                  <div className="flex items-center gap-1.5">
                    {item.discount > 0 && <span className="text-xs line-through text-muted-foreground">{formatPrice(item.productPrice)}</span>}
                    <span className="font-semibold text-sm text-primary">{formatPrice(item.productActualPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {remainingCount > 0 && (
            <div className="text-xs text-center py-2 bg-primary/5 rounded-md border border-primary/10">
              <span className="text-muted-foreground">và thêm </span>
              <span className="font-semibold text-primary">{remainingCount} sản phẩm</span>
            </div>
          )}
        </div>

        {/* Tổng thanh toán - Nổi bật */}
        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
          <span className="font-bold text-base">Tổng thanh toán</span>
          <span className="font-bold text-xl text-primary">{formatPrice(order.totalAmount)}</span>
        </div>

        {/* Actions - Buttons ở góc dưới bên phải */}
        <div className="flex justify-end gap-2">
          <Button asChild size="sm" className="font-semibold">
            <Link href={`/don-hang/${order._id}`} className="flex items-center gap-1">
              Xem chi tiết
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>

          {canCancelOrder && <CancelOrderDialog orderId={order._id} onSuccess={onOrderUpdate} variant="outline" className="h-9 px-3 text-sm" />}

          {canConfirmReceived && (
            <ConfirmReceivedDialog
              orderId={order._id}
              onSuccess={onOrderUpdate}
              variant="default"
              className="h-9 px-3 text-sm bg-green-600 hover:bg-green-700"
            />
          )}

          {canRequestReturn && <ReturnOrderDialog orderId={order._id} onSuccess={onOrderUpdate} variant="outline" className="h-9 px-3 text-sm" />}

          {canRetryPayment && (
            <RetryPaymentDialog
              orderId={order._id}
              onSuccess={onOrderUpdate}
              variant="default"
              className="h-9 px-3 text-sm bg-blue-600 hover:bg-blue-700"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
