"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { viewHistoryService, ViewHistoryItem } from "@/services/viewHistoryService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Trash2, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ViewHistoryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [viewHistory, setViewHistory] = useState<ViewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
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

  const fetchViewHistory = async (page: number = 1) => {
    if (!session?.user?.accessToken) return;

    setLoading(true);
    try {
      const response = await viewHistoryService.getViewHistory(session.user.accessToken, page, pagination.limit);

      if (response.success && response.data) {
        setViewHistory(response.data.viewHistory);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching view history:", error);
      toast.error("Không thể tải lịch sử xem");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchViewHistory(1);
    }
  }, [session?.user?.accessToken]);

  const handleRemoveItem = async (historyId: string) => {
    if (!session?.user?.accessToken) return;

    try {
      const response = await viewHistoryService.removeViewHistory(historyId, session.user.accessToken);

      if (response.success) {
        toast.success("Đã xóa khỏi lịch sử xem");
        // Refresh current page
        fetchViewHistory(pagination.page);
      } else {
        toast.error(response.message || "Không thể xóa khỏi lịch sử xem");
      }
    } catch (error) {
      console.error("Error removing view history item:", error);
      toast.error("Không thể xóa khỏi lịch sử xem");
    }
  };

  const handleClearAll = async () => {
    if (!session?.user?.accessToken) return;
    if (!confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử xem không?")) return;

    try {
      const response = await viewHistoryService.clearViewHistory(session.user.accessToken);

      if (response.success) {
        toast.success("Đã xóa toàn bộ lịch sử xem");
        setViewHistory([]);
        setPagination({
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        });
      } else {
        toast.error(response.message || "Không thể xóa lịch sử xem");
      }
    } catch (error) {
      console.error("Error clearing view history:", error);
      toast.error("Không thể xóa lịch sử xem");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchViewHistory(newPage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  if (!session?.user) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
            <Eye className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lịch sử xem</h1>
              <p className="text-gray-600">{pagination.total} sản phẩm đã xem</p>
            </div>
          </div>

          {viewHistory.length > 0 && (
            <Button onClick={handleClearAll} variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa tất cả
            </Button>
          )}
        </div>

        {/* Content */}
        {viewHistory.length === 0 ? (
          <div className="text-center py-12">
            <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có lịch sử xem</h3>
            <p className="text-gray-600 mb-6">Hãy khám phá các sản phẩm để xem lịch sử của bạn</p>
            <Link href="/products">
              <Button className="bg-green-600 hover:bg-green-700">Khám phá sản phẩm</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {viewHistory.map((item) => (
                <Card key={item._id} className="group hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-4">
                    <div className="relative">
                      <Link href={`/chi-tiet-san-pham/${item.productId.slug}`}>
                        <div className="relative aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={item.productId.images?.[0] || "/placeholder.png"}
                            alt={item.productId.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {item.productId.discount && item.productId.discount > 0 && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">-{item.productId.discount}%</div>
                          )}
                        </div>
                      </Link>

                      <Button
                        onClick={() => handleRemoveItem(item._id)}
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <Link href={`/chi-tiet-san-pham/${item.productId.slug}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-green-600 transition-colors">{item.productId.name}</h3>
                    </Link>

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-green-600">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(item.productId.price * (1 - (item.productId.discount || 0) / 100))}
                        </span>
                        {item.productId.discount && item.productId.discount > 0 && (
                          <span className="text-sm text-gray-500 line-through">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.productId.price)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(item.viewedAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button onClick={() => handlePageChange(pagination.page - 1)} disabled={!pagination.hasPrev} variant="outline" size="sm">
                  Trước
                </Button>

                <div className="flex items-center gap-2">
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                    const page = i + 1;
                    const isActive = page === pagination.page;

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

                <Button onClick={() => handlePageChange(pagination.page + 1)} disabled={!pagination.hasNext} variant="outline" size="sm">
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
