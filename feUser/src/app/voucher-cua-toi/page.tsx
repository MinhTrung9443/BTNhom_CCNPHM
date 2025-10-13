"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { voucherService, UserVoucher } from "@/services/voucherService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Calendar, DollarSign, Percent, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function MyVouchersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [vouchers, setVouchers] = useState<UserVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!session?.user) {
      router.push("/login");
      return;
    }
  }, [session, router]);

  const fetchUserVouchers = async (page: number = 1) => {
    if (!session?.user?.accessToken) return;

    setLoading(true);
    try {
      const response = await voucherService.getUserVouchers(page, 10, session.user.accessToken);

      if (response.success && response.data) {
        setVouchers(response.data.vouchers as UserVoucher[]);
        setPagination(response.data.pagination);
      } else {
        toast.error(response.message || "Không thể tải danh sách voucher");
      }
    } catch (error) {
      console.error("Error fetching user vouchers:", error);
      toast.error("Không thể tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchUserVouchers(newPage);
    }
  };

  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchUserVouchers(1);
    }
  }, [session?.user?.accessToken]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const formatDiscount = (voucher: UserVoucher) => {
    if (voucher.voucher.discountType === "percentage") {
      return `${voucher.voucher.discountValue}%`;
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(voucher.voucher.discountValue);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "available":
        return {
          label: "Có thể sử dụng",
          color: "bg-green-100 text-green-800",
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case "used":
        return {
          label: "Đã sử dụng",
          color: "bg-gray-100 text-gray-800",
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case "expired":
        return {
          label: "Đã hết hạn",
          color: "bg-red-100 text-red-800",
          icon: <XCircle className="w-4 h-4" />,
        };
      case "upcoming":
        return {
          label: "Chưa bắt đầu",
          color: "bg-blue-100 text-blue-800",
          icon: <Clock className="w-4 h-4" />,
        };
      case "inactive":
        return {
          label: "Không khả dụng",
          color: "bg-red-100 text-red-800",
          icon: <AlertCircle className="w-4 h-4" />,
        };
      default:
        return {
          label: "Không xác định",
          color: "bg-gray-100 text-gray-800",
          icon: <AlertCircle className="w-4 h-4" />,
        };
    }
  };

  if (!session?.user) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-64"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Gift className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Voucher của tôi</h1>
              <p className="text-gray-600">{pagination.totalItems} voucher đã lưu</p>
            </div>
          </div>

          <Link href="/voucher">
            <Button className="bg-green-600 hover:bg-green-700">
              <Gift className="w-4 h-4 mr-2" />
              Khám phá voucher
            </Button>
          </Link>
        </div>

        {/* Content */}
        {vouchers.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có voucher nào</h3>
            <p className="text-gray-600 mb-6">Hãy khám phá và lưu các voucher hấp dẫn để tiết kiệm chi phí</p>
            <Link href="/voucher">
              <Button className="bg-green-600 hover:bg-green-700">Khám phá voucher</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Vouchers List */}
            <div className="space-y-4">
              {vouchers.map((userVoucher) => {
                const statusInfo = getStatusInfo(userVoucher.status);

                return (
                  <Card key={userVoucher._id} className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        {/* Voucher Code & Discount */}
                        <div className="flex-shrink-0 text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex flex-col items-center justify-center mb-2 shadow-sm">
                            {userVoucher.voucher.discountType === "percentage" ? (
                              <Percent className="w-6 h-6 text-green-600" />
                            ) : (
                              <DollarSign className="w-6 h-6 text-green-600" />
                            )}
                            <span className="text-xs font-bold text-green-600 mt-1">{formatDiscount(userVoucher)}</span>
                          </div>
                        </div>

                        {/* Voucher Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="bg-green-100 p-1.5 rounded-full flex-shrink-0">
                                <Gift className="w-4 h-4 text-green-600" />
                              </div>
                              <h3 className="font-bold text-lg text-gray-900 truncate">{userVoucher.voucher.code}</h3>
                            </div>
                            <Badge className={`${statusInfo.color} flex items-center gap-1 flex-shrink-0`}>
                              {statusInfo.icon}
                              {statusInfo.label}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Hết hạn: {formatDate(userVoucher.voucher.endDate)}</span>
                              </div>

                              <div>
                                Đơn tối thiểu:{" "}
                                <span className="font-semibold text-green-600">
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(userVoucher.voucher.minPurchaseAmount)}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {userVoucher.voucher.maxDiscountAmount > 0 && (
                                <div>
                                  Giảm tối đa:{" "}
                                  <span className="font-semibold text-green-600">
                                    {new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    }).format(userVoucher.voucher.maxDiscountAmount)}
                                  </span>
                                </div>
                              )}

                              <div className="text-xs text-gray-500">Lưu ngày: {formatDate(userVoucher.createdAt)}</div>

                              {userVoucher.isUsed && userVoucher.orderId && (
                                <div className="text-xs text-gray-500">Đã dùng cho đơn: {userVoucher.orderId.orderNumber}</div>
                              )}
                            </div>
                          </div>

                          {userVoucher.status === "available" && (
                            <div className="mt-4">
                              <Link href="/cart">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  Sử dụng ngay
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={!pagination.hasPrev} variant="outline" size="sm">
                  Trước
                </Button>

                <div className="flex items-center gap-2">
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                    const startPage = Math.max(1, pagination.currentPage - 2);
                    const page = startPage + i;

                    if (page > pagination.totalPages) return null;

                    const isActive = page === pagination.currentPage;

                    return (
                      <Button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        className={isActive ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={!pagination.hasNext} variant="outline" size="sm">
                  Sau
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
