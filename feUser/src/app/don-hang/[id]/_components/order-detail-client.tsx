'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { orderService } from '@/services/orderService';
import type { Order } from '@/types/order';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface OrderDetailClientProps {
  order: Order;
  accessToken: string;
}

export function OrderDetailClient({ order: initialOrder, accessToken }: OrderDetailClientProps) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelOrder = async () => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;

    setIsCancelling(true);
    try {
      const response = await orderService.cancelOrder(accessToken, order._id);
      if (response.success) {
        toast.success('Hủy đơn hàng thành công!');
        // Cập nhật trạng thái đơn hàng trên UI
        setOrder(prevOrder => ({ ...prevOrder, status: 'cancelled', canCancel: false }));
        router.refresh(); // Làm mới dữ liệu từ server
      } else {
        toast.error(response.message || 'Không thể hủy đơn hàng.');
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast.error('Đã xảy ra lỗi khi hủy đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      {order.canCancel && (
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleCancelOrder}
          disabled={isCancelling}
        >
          {isCancelling ? 'Đang xử lý...' : 'Hủy đơn hàng'}
        </Button>
      )}
    </>
  );
}