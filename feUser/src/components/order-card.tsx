/**
 * Order Card Component
 * Component hiển thị thông tin đơn hàng dạng card chuyên nghiệp
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/order-status-badge';
import { CancelOrderDialog } from '@/components/cancel-order-dialog';
import type { Order } from '@/types/order';
import { cn } from '@/lib/utils';
import { Package, ChevronRight, Clock } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onOrderUpdate?: () => void;
}

export function OrderCard({ order, onOrderUpdate }: OrderCardProps) {
  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  // Lấy trạng thái mới nhất từ timeline
  const getLatestStatus = () => {
    if (!order.timeline || order.timeline.length === 0) {
      return {
        status: order.status,
        description: 'Đơn hàng đang được xử lý',
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
    order.status === 'pending' || 
    (order.status === 'processing' && ['confirmed', 'preparing'].includes(latestDetailedStatus || ''));

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3 border-b bg-muted/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">
                #{order._id.slice(-8).toUpperCase()}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <OrderStatusBadge status={order.status} />
            <p className="text-xs text-muted-foreground max-w-[200px] text-right">
              {latestStatus.description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Danh sách sản phẩm */}
        <div className="space-y-3 mb-4">
          {displayProducts.map((item, index) => (
            <div key={index} className="flex gap-3">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 border">
                <Image
                  src={item.productImage}
                  alt={item.productName}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-2 mb-1">
                  {item.productName}
                </h4>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    x{item.quantity}
                  </span>
                  <div className="flex items-center gap-2">
                    {item.discount > 0 && (
                      <span className="text-xs line-through text-muted-foreground">
                        {formatPrice(item.productPrice)}
                      </span>
                    )}
                    <span className="font-semibold text-sm text-primary">
                      {formatPrice(item.productActualPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {remainingCount > 0 && (
            <div className="text-sm text-muted-foreground text-center py-2 bg-muted/50 rounded-md">
              và <span className="font-semibold text-primary">{remainingCount}</span> sản phẩm khác
            </div>
          )}
        </div>

        {/* Thông tin thanh toán */}
        <div className="border-t pt-4 space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tổng tiền hàng:</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Phí vận chuyển:</span>
            <span>{formatPrice(order.shippingFee)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Giảm giá:</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          {order.pointsApplied > 0 && (
            <div className="flex justify-between text-sm text-blue-600">
              <span>Điểm tích lũy:</span>
              <span>-{formatPrice(order.pointsApplied)}</span>
            </div>
          )}
          <div className="flex justify-between items-center font-bold text-base border-t pt-2">
            <span>Tổng thanh toán:</span>
            <span className="text-primary text-lg">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>

        {/* Phương thức thanh toán */}
        <div className="mb-4 p-3 bg-muted/50 rounded-md">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Phương thức thanh toán:</span>
            <span className="font-medium">{order.payment.paymentMethod}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">Trạng thái thanh toán:</span>
            <span className={cn(
              "font-medium",
              order.payment.status === 'completed' && 'text-green-600',
              order.payment.status === 'pending' && 'text-yellow-600',
              order.payment.status === 'failed' && 'text-red-600'
            )}>
              {order.payment.status === 'completed' && 'Đã thanh toán'}
              {order.payment.status === 'pending' && 'Chờ thanh toán'}
              {order.payment.status === 'failed' && 'Thất bại'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/don-hang/${order._id}`} className="flex items-center justify-center">
              Xem chi tiết
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          
          {canCancelOrder && (
            <CancelOrderDialog 
              orderId={order._id} 
              onSuccess={onOrderUpdate}
              variant="destructive"
              className="flex-1"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
