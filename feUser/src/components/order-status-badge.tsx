/**
 * Order Status Badge Component
 * Component hiển thị trạng thái đơn hàng với màu sắc phù hợp
 */

import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/types/order';
import { cn } from '@/lib/utils';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; variant: string; className: string }> = {
  new: {
    label: 'Mới tạo',
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  },
  confirmed: {
    label: 'Đã xác nhận',
    variant: 'default',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  },
  preparing: {
    label: 'Đang chuẩn bị',
    variant: 'default',
    className: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  },
  processing: {
    label: 'Đang xử lý',
    variant: 'default',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  },
  shipping_in_progress: {
    label: 'Đang giao hàng',
    variant: 'default',
    className: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
  },
  delivered: {
    label: 'Đã giao hàng',
    variant: 'default',
    className: 'bg-teal-100 text-teal-800 hover:bg-teal-200',
  },
  completed: {
    label: 'Hoàn thành',
    variant: 'default',
    className: 'bg-green-100 text-green-800 hover:bg-green-200',
  },
  cancelled: {
    label: 'Đã hủy',
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 hover:bg-red-200',
  },
  refunded: {
    label: 'Đã hoàn tiền',
    variant: 'secondary',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  },
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.new;

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
