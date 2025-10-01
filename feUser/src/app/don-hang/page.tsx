/**
 * My Orders Page
 * Trang quản lý đơn hàng của người dùng
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { orderService } from '@/services/orderService';
import type { Order, OrderStatus, OrderStats } from '@/types/order';

// API chỉ chấp nhận các status này
type ApiOrderStatus = 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled' | 'return_refund';
import { OrderStatusBadge } from '@/components/order-status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mapping trạng thái - sử dụng đúng API status
const getStatusTabsWithCounts = (stats?: OrderStats) => {
  const allCount = stats ?
    stats.pending.count + stats.processing.count + stats.shipping.count +
    stats.completed.count + stats.cancelled.count + stats.return_refund.count : 0;

  return [
    { value: 'all' as const, label: 'Tất cả', count: allCount },
    { value: 'pending' as ApiOrderStatus, label: 'Chờ xác nhận', count: stats?.pending.count || 0 },
    { value: 'processing' as ApiOrderStatus, label: 'Đang xử lý', count: stats?.processing.count || 0 },
    { value: 'shipping' as ApiOrderStatus, label: 'Đang giao hàng', count: stats?.shipping.count || 0 },
    { value: 'completed' as ApiOrderStatus, label: 'Hoàn thành', count: stats?.completed.count || 0 },
    { value: 'cancelled' as ApiOrderStatus, label: 'Đã hủy', count: stats?.cancelled.count || 0 },
    { value: 'return_refund' as ApiOrderStatus, label: 'Đã hoàn tiền', count: stats?.return_refund.count || 0 },
  ];
};

export default function MyOrdersPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [searchInput, setSearchInput] = useState(''); // Input value
  const [searchQuery, setSearchQuery] = useState(''); // Actual search query for API
  const [selectedStatus, setSelectedStatus] = useState<ApiOrderStatus | 'all'>('all');
  const [orderStats, setOrderStats] = useState<OrderStats>();
  const [statsLoading, setStatsLoading] = useState(true);

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [sessionStatus, router]);

  // Load order stats
  useEffect(() => {
    async function loadOrderStats() {
      if (!session?.user?.accessToken) return;

      try {
        setStatsLoading(true);
        const response = await orderService.getMyStats(session.user.accessToken);
        if (response.success) {
          setOrderStats(response.data);
        }
      } catch (error) {
        console.error('Failed to load order stats:', error);
      } finally {
        setStatsLoading(false);
      }
    }

    if (session?.user?.accessToken) {
      loadOrderStats();
    }
  }, [session]);

  // Load orders
  useEffect(() => {
    async function loadOrders() {
      if (!session?.user?.accessToken) return;

      try {
        setLoading(true);
        const params = {
          page: currentPage,
          limit: 10,
          ...(selectedStatus !== 'all' && { status: selectedStatus }),
          ...(searchQuery && { search: searchQuery }),
        };

        const response = await orderService.getMyOrders(session.user.accessToken, params);

        setOrders(response.data);
        setTotalPages(response.pagination.total);
        setTotalOrders(response.pagination.totalOrders);
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.accessToken) {
      loadOrders();
    }
  }, [session, currentPage, selectedStatus, searchQuery]);

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

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput); // Cập nhật search query từ input
    setCurrentPage(1);
  };

  if (sessionStatus === 'loading' || sessionStatus === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Đơn hàng của tôi</h1>
        <p className="text-muted-foreground">
          Quản lý và theo dõi các đơn hàng của bạn
        </p>
      </div>

      {/* Search & Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên sản phẩm..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Tìm kiếm</Button>
          </form>

          <Tabs value={selectedStatus} onValueChange={(value) => {
            setSelectedStatus(value as ApiOrderStatus | 'all');
            setCurrentPage(1);
          }}>
            <TabsList className="flex flex-wrap h-auto">
              {getStatusTabsWithCounts(orderStats).map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex-shrink-0">
                  <span className="flex items-center gap-2">
                    {tab.label}
                    {!statsLoading && (
                      <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {tab.count}
                      </span>
                    )}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Chưa có đơn hàng</h3>
            <p className="text-muted-foreground mb-4">Bạn chưa có đơn hàng nào</p>
            <Button asChild>
              <Link href="/">Tiếp tục mua sắm</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {orders.map((order) => (
              <Card key={order._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Đơn hàng #{order._id.slice(-8).toUpperCase()}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.orderLines.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{item.productName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Số lượng: {item.quantity}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {item.discount > 0 && (
                              <span className="text-sm line-through text-muted-foreground">
                                {formatPrice(item.productPrice)}
                              </span>
                            )}
                            <span className="font-semibold">
                              {formatPrice(item.productActualPrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Tổng tiền hàng:</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Phí vận chuyển:</span>
                      <span>{formatPrice(order.shippingFee)}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                      <span>Tổng thanh toán:</span>
                      <span className="text-primary">{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-4">
                    <Button asChild variant="outline" className="flex-1">
                      <Link href={`/don-hang/${order._id}`}>
                        Xem chi tiết
                      </Link>
                    </Button>
                    {order.canCancel && (
                      <Button variant="destructive" className="flex-1">
                        Hủy đơn hàng
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      currentPage === page && 'pointer-events-none'
                    )}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Total Orders Info */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            Hiển thị {orders.length} trong tổng số {totalOrders} đơn hàng
          </p>
        </>
      )}
    </div>
  );
}
