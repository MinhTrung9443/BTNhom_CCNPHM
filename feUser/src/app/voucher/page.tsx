"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { voucherService, PublicVoucher } from "@/services/voucherService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Gift, Clock, Users, Calendar, Percent, DollarSign, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function VoucherPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [publicVouchers, setPublicVouchers] = useState<PublicVoucher[]>([]);
  const [upcomingVouchers, setUpcomingVouchers] = useState<PublicVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingVouchers, setClaimingVouchers] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({
    public: {
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      hasNext: false,
      hasPrev: false,
    },
    upcoming: {
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      hasNext: false,
      hasPrev: false,
    },
  });

  const fetchPublicVouchers = async (page: number = 1) => {
    if (!session?.user?.accessToken) return;

    setLoading(true);
    try {
      const response = await voucherService.getPublicVouchers(page, 12, session.user.accessToken);

      if (response.success && response.data) {
        setPublicVouchers(response.data.vouchers as PublicVoucher[]);
        setPagination((prev) => ({
          ...prev,
          public: response.data.pagination,
        }));
      } else {
        toast.error(response.message || "Không thể tải danh sách voucher");
      }
    } catch (error) {
      console.error("Error fetching public vouchers:", error);
      toast.error("Không thể tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingVouchers = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await voucherService.getUpcomingVouchers(page, 12);

      if (response.success && response.data) {
        setUpcomingVouchers(response.data.vouchers as PublicVoucher[]);
        setPagination((prev) => ({
          ...prev,
          upcoming: response.data.pagination,
        }));
      } else {
        toast.error(response.message || "Không thể tải danh sách voucher sắp mở");
      }
    } catch (error) {
      console.error("Error fetching upcoming vouchers:", error);
      toast.error("Không thể tải danh sách voucher sắp mở");
    } finally {
      setLoading(false);
    }
  };

  const handleClaimVoucher = async (voucherId: string) => {
    if (!session?.user?.accessToken) {
      router.push("/login");
      return;
    }

    setClaimingVouchers((prev) => new Set([...prev, voucherId]));

    try {
      const response = await voucherService.claimVoucher(voucherId, session.user.accessToken);

      if (response.success) {
        toast.success(response.message || "Lưu voucher thành công!");
        // Refresh current tab
        fetchPublicVouchers(pagination.public.currentPage);
      } else {
        toast.error(response.message || "Không thể lưu voucher");
      }
    } catch (error) {
      console.error("Error claiming voucher:", error);
      toast.error("Không thể lưu voucher");
    } finally {
      setClaimingVouchers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(voucherId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchPublicVouchers(1);
    fetchUpcomingVouchers(1);
  }, [session?.user?.accessToken]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const formatDiscount = (voucher: PublicVoucher) => {
    if (voucher.discountType === "percentage") {
      return `${voucher.discountValue}%`;
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(voucher.discountValue);
  };

  const VoucherCard = ({ voucher, isUpcoming = false }: { voucher: PublicVoucher; isUpcoming?: boolean }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300 relative overflow-hidden border-l-4 border-l-green-500 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="space-y-3">
          <div className="flex justify-between items-start gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                <Gift className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-bold text-lg text-green-600 truncate">{voucher.code}</h3>
            </div>
            {!isUpcoming && (
              <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 whitespace-nowrap flex-shrink-0">
                <Users className="w-3 h-3 mr-1" />
                {voucher.globalUsageLimit !== null ? `${voucher.currentUsage}/${voucher.globalUsageLimit}` : "∞"}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-50 to-green-100 rounded-lg py-3">
            {voucher.discountType === "percentage" ? (
              <Percent className="w-5 h-5 text-green-600" />
            ) : (
              <DollarSign className="w-5 h-5 text-green-600" />
            )}
            <span className="text-3xl font-bold text-green-700">{formatDiscount(voucher)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1 flex flex-col">
        <div className="space-y-2 text-sm text-gray-600 flex-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{isUpcoming ? `Bắt đầu: ${formatDate(voucher.startDate)}` : `Đến: ${formatDate(voucher.endDate)}`}</span>
          </div>

          <div>
            Áp dụng cho đơn hàng từ:{" "}
            <span className="font-semibold text-green-600">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(voucher.minPurchaseAmount)}
            </span>
          </div>

          {voucher.maxDiscountAmount > 0 && (
            <div>
              Giảm tối đa:{" "}
              <span className="font-semibold text-green-600">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(voucher.maxDiscountAmount)}
              </span>
            </div>
          )}
          
          {/* Thông tin số lượt sử dụng */}
          {!isUpcoming && (
            <div className="pt-2 border-t border-gray-200 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Tổng lượt (toàn hệ thống):</span>
                <span className="font-semibold text-blue-600">
                  {voucher.globalUsageLimit !== null ? (
                    <>
                      {voucher.currentUsage}/{voucher.globalUsageLimit}
                      {voucher.availableSlots !== null && voucher.availableSlots > 0 && (
                        <span className="text-green-600 ml-1">(còn {voucher.availableSlots})</span>
                      )}
                    </>
                  ) : (
                    <span className="text-green-600">Không giới hạn</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Giới hạn mỗi người:</span>
                {voucher.userUsageLimit !== null && voucher.userUsageLimit !== undefined ? (
                  <span className="font-semibold text-purple-600">{voucher.userUsageLimit} lần</span>
                ) : (
                  <span className="font-semibold text-green-600">Không giới hạn</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto space-y-3">
          {!isUpcoming && session?.user ? (
            <>
              {voucher.isClaimed && (
                <div className="text-sm text-center bg-gradient-to-r from-purple-50 to-blue-50 py-2.5 rounded-md border border-purple-200">
                  <div className="text-xs text-purple-600 font-semibold mb-1">📊 Thống kê của bạn</div>
                  {voucher.remainingUsage !== null ? (
                    <div className="text-gray-700">
                      Đã dùng: <span className="font-bold text-purple-600">{voucher.usageCount}</span>/{voucher.userUsageLimit}
                      {voucher.remainingUsage > 0 ? (
                        <span className="block mt-1 text-green-600 font-semibold">
                          ✓ Bạn còn {voucher.remainingUsage} lần nữa
                        </span>
                      ) : (
                        <span className="block mt-1 text-red-600 font-semibold">
                          ✗ Bạn đã hết lượt
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-700">
                      Đã dùng: <span className="font-bold text-purple-600">{voucher.usageCount}</span> lần
                      <span className="block mt-1 text-green-600 font-semibold">
                        ✓ Bạn không bị giới hạn
                      </span>
                    </div>
                  )}
                </div>
              )}
              <Button
                onClick={() => handleClaimVoucher(voucher._id)}
                disabled={voucher.isClaimed || claimingVouchers.has(voucher._id)}
                className={`w-full ${voucher.isClaimed ? "bg-gray-400 hover:bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
              >
                {claimingVouchers.has(voucher._id) ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang lưu...
                  </span>
                ) : voucher.isClaimed ? (
                  "Đã lưu"
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Lưu voucher
                  </span>
                )}
              </Button>
            </>
          ) : !isUpcoming && !session?.user ? (
            <Button onClick={() => router.push("/login")} className="w-full bg-green-600 hover:bg-green-700">
              Đăng nhập để lưu
            </Button>
          ) : (
            <Button disabled className="w-full bg-gray-400">
              <Clock className="w-4 h-4 mr-2" />
              Chưa mở
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const PaginationControls = ({ paginationData, onPageChange }: { paginationData: any; onPageChange: (page: number) => void }) =>
    paginationData.totalPages > 1 && (
      <div className="flex justify-center items-center gap-2 mt-8">
        <Button onClick={() => onPageChange(paginationData.currentPage - 1)} disabled={!paginationData.hasPrev} variant="outline" size="sm">
          Trước
        </Button>

        <div className="flex items-center gap-2">
          {[...Array(Math.min(5, paginationData.totalPages))].map((_, i) => {
            const startPage = Math.max(1, paginationData.currentPage - 2);
            const page = startPage + i;

            if (page > paginationData.totalPages) return null;

            const isActive = page === paginationData.currentPage;

            return (
              <Button
                key={page}
                onClick={() => onPageChange(page)}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={isActive ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {page}
              </Button>
            );
          })}
        </div>

        <Button onClick={() => onPageChange(paginationData.currentPage + 1)} disabled={!paginationData.hasNext} variant="outline" size="sm">
          Sau
        </Button>
      </div>
    );

  if (loading && publicVouchers.length === 0 && upcomingVouchers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Gift className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Voucher khuyến mãi</h1>
              <p className="text-gray-600">Khám phá và lưu các voucher hấp dẫn</p>
            </div>
          </div>

          {session?.user && (
            <Link href="/voucher-cua-toi">
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                <Gift className="w-4 h-4 mr-2" />
                Voucher của tôi
              </Button>
            </Link>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="available">Đang khả dụng</TabsTrigger>
            <TabsTrigger value="upcoming">Sắp mở</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="mt-6">
            {publicVouchers.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có voucher khả dụng</h3>
                <p className="text-gray-600">Hãy quay lại sau để khám phá các voucher mới</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {publicVouchers.map((voucher) => (
                    <VoucherCard key={voucher._id} voucher={voucher} />
                  ))}
                </div>
                <PaginationControls paginationData={pagination.public} onPageChange={fetchPublicVouchers} />
              </>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            {upcomingVouchers.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có voucher sắp mở</h3>
                <p className="text-gray-600">Các voucher mới sẽ sớm ra mắt, hãy theo dõi nhé!</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {upcomingVouchers.map((voucher) => (
                    <VoucherCard key={voucher._id} voucher={voucher} isUpcoming />
                  ))}
                </div>
                <PaginationControls paginationData={pagination.upcoming} onPageChange={fetchUpcomingVouchers} />
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
