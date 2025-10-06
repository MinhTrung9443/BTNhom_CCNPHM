'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { loyaltyService, LoyaltyBalance, LoyaltyTransaction, ExpiringPointsData } from '@/services/loyaltyService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, TrendingUp, TrendingDown, Clock, Calendar, AlertCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function LoyaltyPointsPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  
  const [balance, setBalance] = useState<LoyaltyBalance | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [expiringPoints, setExpiringPoints] = useState<ExpiringPointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'earn' | 'redeem' | 'expire'>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.accessToken) {
      loadBalance();
      loadHistory('all', 1);
      loadExpiringPoints();
    }
  }, [status, session]);

  const loadBalance = async () => {
    try {
      setLoading(true);
      const response = await loyaltyService.getBalance(session!.user.accessToken);
      if (response.success) {
        setBalance(response.data);
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tải thông tin điểm tích lũy',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (type: 'all' | 'earn' | 'redeem' | 'expire', page: number) => {
    try {
      setLoadingHistory(true);
      const response = await loyaltyService.getTransactions(session!.user.accessToken, type, page, 10);
      if (response.success) {
        setTransactions(response.data);
        setTotalPages(response.totalPages);
        setCurrentPage(response.currentPage);
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tải lịch sử giao dịch',
        variant: 'destructive',
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadExpiringPoints = async () => {
    try {
      const response = await loyaltyService.getExpiringPoints(session!.user.accessToken, 30);
      if (response.success) {
        setExpiringPoints(response.data);
      }
    } catch (error: any) {
      console.error('Không thể tải thông tin điểm sắp hết hạn:', error);
    }
  };

  const handleTabChange = (value: string) => {
    const type = value as 'all' | 'earn' | 'redeem' | 'expire';
    setActiveTab(type);
    loadHistory(type, 1);
  };

  const handlePageChange = (page: number) => {
    loadHistory(activeTab, page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'redeem':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'expire':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earn':
        return 'text-green-600';
      case 'redeem':
        return 'text-red-600';
      case 'expire':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Điểm tích lũy</h1>
          <p className="text-muted-foreground">
            Quản lý và theo dõi điểm tích lũy của bạn
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Coins className="h-5 w-5" />
                Điểm hiện có
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {balance?.currentPoints.toLocaleString('vi-VN') || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Điểm có thể sử dụng
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Sắp hết hạn (30 ngày)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {expiringPoints?.totalExpiringPoints.toLocaleString('vi-VN') || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Điểm sẽ hết hạn trong 30 ngày tới
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Ngày hết hạn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {balance?.expirationDate 
                  ? new Date(balance.expirationDate).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Cuối tháng hiện tại
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Lịch sử giao dịch</CardTitle>
            <CardDescription>
              Xem chi tiết các giao dịch tích điểm và sử dụng điểm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                <TabsTrigger value="earn">Tích điểm</TabsTrigger>
                <TabsTrigger value="redeem">Dùng điểm</TabsTrigger>
                <TabsTrigger value="expire">Hết hạn</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {loadingHistory ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Chưa có giao dịch nào
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {transactions.map((transaction) => (
                        <div
                          key={transaction._id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <div className="mt-1">
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(transaction.createdAt)}
                              </p>
                              {transaction.expiresAt && transaction.status === 'active' && (
                                <p className="text-xs text-orange-600 mt-1">
                                  Hết hạn: {formatDate(transaction.expiresAt)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-semibold ${getTransactionColor(transaction.type)}`}>
                              {transaction.type === 'redeem' || transaction.type === 'expire' ? '-' : '+'}
                              {Math.abs(transaction.points).toLocaleString('vi-VN')}
                            </div>
                            <Badge variant={transaction.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                              {transaction.status === 'active' ? 'Hoạt động' : 
                               transaction.status === 'expired' ? 'Hết hạn' : 'Đã dùng'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center gap-2 mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Trước
                        </Button>
                        <div className="flex items-center gap-2">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={currentPage === page ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Sau
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Expiring Points Details */}
        {expiringPoints && expiringPoints.details.length > 0 && (
          <Card className="mt-6 border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="h-5 w-5" />
                Chi tiết điểm sắp hết hạn
              </CardTitle>
              <CardDescription>
                Các giao dịch tích điểm sẽ hết hạn trong 30 ngày tới
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expiringPoints.details.map((detail, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-100"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{detail.description}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>
                          Nhận: {new Date(detail.earnedDate).toLocaleDateString('vi-VN')}
                        </span>
                        <span>•</span>
                        <span className="text-orange-600 font-medium">
                          Hết hạn: {new Date(detail.expiryDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-orange-600">
                        {detail.points.toLocaleString('vi-VN')} điểm
                      </div>
                      <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                        Còn {detail.daysRemaining} ngày
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-none">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Thông tin về điểm tích lũy
              </h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Tích 1 điểm cho mỗi 100 VNĐ khi mua hàng</li>
                <li>• Điểm nhận được sẽ hết hạn vào cuối tháng kế tiếp</li>
                <li>• Sử dụng điểm để giảm giá khi thanh toán</li>
                <li>• Điểm danh hàng ngày để nhận thêm điểm miễn phí</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
