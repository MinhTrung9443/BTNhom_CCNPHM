/**
 * Order Detail Page (Server Component)
 * Trang chi tiết đơn hàng được render phía máy chủ
 */
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { orderService } from "@/services/orderService";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, CreditCard, Package, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderDetailClient } from "./_components/order-detail-client";
import { OrderItemsWithSnapshot } from "./_components/order-items-with-snapshot";

// Helper functions for formatting
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};

// Main Server Component
export default async function OrderDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user?.accessToken) {
    redirect("/login");
  }

  const response = await orderService.getOrderById(session.user.accessToken, params.id);

  if (!response.success || !response.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-xl font-semibold mb-2">Không thể tải đơn hàng</h3>
            <p className="text-muted-foreground mb-4 text-center">{response.message || "Đơn hàng không tồn tại hoặc bạn không có quyền xem."}</p>
            <Button asChild>
              <Link href="/don-hang">Quay lại danh sách đơn hàng</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const order = response.data;

  // Lấy trạng thái chi tiết mới nhất
  const getLatestDetailedStatus = () => {
    if (!order.timeline || order.timeline.length === 0) return undefined;
    return order.timeline[order.timeline.length - 1]?.status;
  };

  const latestDetailedStatus = getLatestDetailedStatus();

  // Kiểm tra có thể hủy đơn
  const canCancelOrder = 
    order.status === 'pending' || 
    (order.status === 'processing' && ['confirmed', 'preparing'].includes(latestDetailedStatus || ''));

  // Kiểm tra có thể xác nhận đã nhận hàng: status=shipping và detailed status=delivered
  const canConfirmReceived = 
    order.status === 'shipping' && latestDetailedStatus === 'delivered';

  // Kiểm tra có thể yêu cầu trả hàng: status=shipping và detailed status=delivered
  const canRequestReturn = 
    order.status === 'shipping' && latestDetailedStatus === 'delivered';

  return (
    <div className="bg-muted/40">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-4">
          <Button variant="ghost" asChild>
            <Link href="/don-hang">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách
            </Link>
          </Button>
        </div>

        {/* Main Content Wrapper */}
        <main className="bg-background rounded-xl shadow-sm border p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Chi tiết Đơn hàng</h1>
              <p className="text-muted-foreground">
                Mã đơn: <span className="font-medium text-foreground">{order.orderCode || `#${order._id.slice(-8).toUpperCase()}`}</span>
              </p>
              <p className="text-sm text-muted-foreground">Đặt hàng lúc: {formatDate(order.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-end">
              <OrderStatusBadge status={order.status} />
              <Suspense fallback={null}>
                <OrderDetailClient
                  orderId={order._id}
                  canCancel={canCancelOrder}
                  canConfirmReceived={canConfirmReceived}
                  canReturn={canRequestReturn}
                  orderStatus={order.status}
                  latestDetailedStatus={latestDetailedStatus}
                />
              </Suspense>
            </div>
          </div>

          <Separator />

          {/* Grid Layout */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Sản phẩm trong đơn ({order.orderLines.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderItemsWithSnapshot order={order} />
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Lịch sử đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.timeline.map((event, index) => {
                      const isLast = index === order.timeline.length - 1;
                      return (
                        <div key={event._id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={cn("rounded-full p-1.5", isLast ? "bg-primary" : "bg-muted")}>
                              <CheckCircle2 className={cn("h-4 w-4", isLast ? "text-primary-foreground" : "text-muted-foreground")} />
                            </div>
                            {!isLast && <div className="w-0.5 h-full bg-muted mt-2" />}
                          </div>
                          <div className="flex-1 pb-4 border-b border-dashed last:border-none last:pb-0">
                            <p className="font-medium">{event.description}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(event.timestamp)}</p>
                            <p className="text-xs text-muted-foreground mt-1 capitalize">Thực hiện bởi: {event.performedBy}</p>
                            {event.metadata?.reason && (
                              <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded text-sm">
                                <span className="font-medium text-amber-900 dark:text-amber-100">Lý do: </span>
                                <span className="text-amber-800 dark:text-amber-200">{event.metadata.reason}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="space-y-8">
              {/* Order Summary */}
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Tóm tắt đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phí vận chuyển</span>
                    <span>{formatPrice(order.shippingFee)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Giảm giá</span>
                      <span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  {order.pointsApplied > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>Điểm tích lũy</span>
                      <span>-{formatPrice(order.pointsApplied)}</span>
                    </div>
                  )}
                  {order.voucherCode && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Mã giảm giá</span>
                      <span className="font-mono text-sm bg-green-100 px-2 py-0.5 rounded">{order.voucherCode}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Tổng cộng</span>
                    <span className="text-primary">{formatPrice(order.totalAmount)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Địa chỉ nhận hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="font-semibold text-base">{order.shippingAddress.recipientName}</p>
                  <p>{order.shippingAddress.phoneNumber}</p>
                  <p className="text-muted-foreground">
                    {order.shippingAddress.street}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}
                  </p>
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Thông tin thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phương thức</span>
                    <span className="font-medium">{order.payment.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trạng thái</span>
                    <span className="font-medium capitalize">{order.payment.status}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
