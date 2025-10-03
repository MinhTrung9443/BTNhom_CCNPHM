/**
 * My Orders Page
 * Trang quản lý đơn hàng của người dùng
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { orderService } from '@/services/orderService';
import type { Order, OrderStats, ApiOrderStatus } from '@/types/order';
import { OrderCard } from '@/components/order-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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

  // Load orders function
  const loadOrders = async () => {
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
  };

  // Load orders
  useEffect(() => {
    if (session?.user?.accessToken) {
      loadOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, currentPage, selectedStatus, searchQuery]);

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
    <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Đơn hàng của tôi</h1>
              <p className="text-muted-foreground mt-1">
                Quản lý và theo dõi các đơn hàng của bạn
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <Card className="mb-8 shadow-sm border-muted">
          <CardContent className="pt-6 pb-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm theo tên sản phẩm, mã đơn hàng..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <Button type="submit" className="sm:w-auto w-full h-11 px-6">Tìm kiếm</Button>
            </form>

            <Tabs value={selectedStatus} onValueChange={(value) => {
              setSelectedStatus(value as ApiOrderStatus | 'all');
              setCurrentPage(1);
            }}>
              <TabsList className="w-full flex flex-wrap h-auto p-1 bg-muted/50">
                {getStatusTabsWithCounts(orderStats).map((tab) => (
                  <TabsTrigger 
                    key={tab.value} 
                    value={tab.value} 
                    className="flex-shrink-0 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <span className="flex items-center gap-2">
                      {tab.label}
                      {!statsLoading && (
                        <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full min-w-[24px] text-center">
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
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-72 w-full rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="shadow-sm border-muted">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-muted/50 rounded-full mb-4">
                <Package className="h-16 w-16 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Chưa có đơn hàng</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                {selectedStatus === 'all' 
                  ? 'Bạn chưa có đơn hàng nào. Hãy khám phá và mua sắm các sản phẩm đặc sản Sóc Trăng ngay!' 
                  : 'Không có đơn hàng nào phù hợp với bộ lọc này'}
              </p>
              <Button asChild size="lg">
                <Link href="/">Tiếp tục mua sắm</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-5 mb-8">
              {orders.map((order) => (
                <OrderCard 
                  key={order._id} 
                  order={order} 
                  onOrderUpdate={() => {
                    // Reload orders khi hủy đơn thành công
                    setCurrentPage(1);
                    loadOrders();
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Card className="shadow-sm border-muted">
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground order-2 sm:order-1">
                      Hiển thị <span className="font-semibold text-foreground">{orders.length}</span> trong tổng số <span className="font-semibold text-foreground">{totalOrders}</span> đơn hàng
                    </p>
                    
                    <div className="flex items-center gap-2 order-1 sm:order-2">
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="h-9 w-9"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let page;
                          if (totalPages <= 5) {
                            page = i + 1;
                          } else if (currentPage <= 3) {
                            page = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            page = totalPages - 4 + i;
                          } else {
                            page = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? 'default' : 'outline'}
                              size="icon"
                              onClick={() => setCurrentPage(page)}
                              className={cn(
                                'h-9 w-9',
                                currentPage === page && 'pointer-events-none'
                              )}
                            >
                              {page}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="h-9 w-9"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
