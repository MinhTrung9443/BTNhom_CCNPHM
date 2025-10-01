/**
 * Order Detail Page (Server Component)
 * Trang chi tiết đơn hàng được render phía máy chủ
 */
import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@/auth';
import { orderService } from '@/services/orderService';
import { OrderStatusBadge } from '@/components/order-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  Package, 
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrderDetailClient } from './_components/order-detail-client';

// Helper functions for formatting
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

// Main Server Component
export default async function OrderDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user?.accessToken) {
    redirect('/login');
  }

  const response = await orderService.getOrderById(session.user.accessToken, params.id);

  if (!response.success || !response.data) {
    return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Không thể tải đơn hàng</h3>
                    <p className="text-muted-foreground mb-4 text-center">
                        {response.message || 'Đơn hàng không tồn tại hoặc bạn không có quyền xem.'}
                    </p>
                    <Button asChild>
                        <Link href="/don-hang">Quay lại danh sách đơn hàng</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  const order = response.data;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/don-hang">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Link>
      </Button>

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Đơn hàng #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-muted-foreground">
            Đặt hàng lúc {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
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
                        <div className={cn(
                          "rounded-full p-1.5",
                          isLast ? "bg-primary" : "bg-muted"
                        )}>
                          <CheckCircle2 className={cn(
                            "h-4 w-4",
                            isLast ? "text-primary-foreground" : "text-muted-foreground"
                          )} />
                        </div>
                        {!isLast && (
                          <div className="w-0.5 h-full bg-muted mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium">{event.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(event.timestamp)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                          Thực hiện bởi: {event.performedBy}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Sản phẩm ({order.orderLines.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderLines.map((item, index) => (
                  <div key={index}>
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium mb-1">{item.productName}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Mã SP: {item.productCode}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {item.discount > 0 && (
                              <>
                                <span className="text-sm line-through text-muted-foreground">
                                  {formatPrice(item.productPrice)}
                                </span>
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                                  -{item.discount}%
                                </span>
                              </>
                            )}
                          </div>
                          <p className="text-muted-foreground">x{item.quantity}</p>
                        </div>
                        <p className="font-semibold mt-1">
                          {formatPrice(item.productActualPrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {formatPrice(item.lineTotal)}
                        </p>
                      </div>
                    </div>
                    {index < order.orderLines.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Địa chỉ nhận hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-semibold">{order.shippingAddress.recipientName}</p>
              <p className="text-sm">{order.shippingAddress.phoneNumber}</p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.street}, {order.shippingAddress.ward}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.district}, {order.shippingAddress.province}
              </p>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phương thức:</span>
                <span className="font-medium">{order.payment.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trạng thái:</span>
                <span className="font-medium capitalize">{order.payment.status}</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phí vận chuyển:</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Giảm giá:</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              {order.pointsApplied > 0 && (
                <div className="flex justify-between text-blue-600">
                  <span>Điểm tích lũy:</span>
                  <span>-{formatPrice(order.pointsApplied)}</span>
                </div>
              )}
              {order.voucherCode && (
                <div className="flex justify-between text-green-600">
                  <span>Mã giảm giá:</span>
                  <span className="font-mono text-sm">{order.voucherCode}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng cộng:</span>
                <span className="text-primary">{formatPrice(order.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions - Client Component */}
          <OrderDetailClient order={order} accessToken={session.user.accessToken} />
        </div>
      </div>
    </div>
  );
}
