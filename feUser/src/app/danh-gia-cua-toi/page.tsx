"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { reviewService, UserReview } from "@/services/reviewService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MessageSquare, Calendar, Gift } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function MyReviewsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalReviews: 0,
    hasNext: false,
    hasPrev: false,
    limit: 10,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!session?.user) {
      router.push("/login");
      return;
    }
  }, [session, router]);

  const fetchUserReviews = async (page: number = 1) => {
    if (!session?.user?.accessToken) return;

    setLoading(true);
    try {
      const response = await reviewService.getUserReviews(page, pagination.limit, session.user.accessToken);

      if (response.success && response.data) {
        setReviews(response.data.reviews || []);
        setPagination(response.data.pagination);
      } else {
        toast.error(response.message || "Không thể tải danh sách đánh giá");
      }
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      toast.error("Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchUserReviews(newPage);
    }
  };

  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchUserReviews(1);
    }
  }, [session?.user?.accessToken]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star key={index} className={`w-4 h-4 ${index < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ));
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
              {[...Array(3)].map((_, i) => (
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
        <div className="flex items-center gap-3 mb-8">
          <MessageSquare className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Đánh giá của tôi</h1>
            <p className="text-gray-600">{pagination.totalReviews} đánh giá đã đăng</p>
          </div>
        </div>

        {/* Content */}
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có đánh giá nào</h3>
            <p className="text-gray-600 mb-6">Hãy mua hàng và đánh giá sản phẩm để chia sẻ trải nghiệm của bạn</p>
            <Link href="/products">
              <Button className="bg-green-600 hover:bg-green-700">Khám phá sản phẩm</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <Card key={review._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                        <Image src={review.productId.images?.[0] || "/placeholder.png"} alt={review.productId.name} fill className="object-cover" />
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="flex-1">
                      {/* Product Name */}
                      <h3 className="font-semibold text-gray-900 mb-2 hover:text-green-600">
                        <Link href={`/chi-tiet-san-pham/${review.productId.slug || review.productId._id}`}>{review.productId.name}</Link>
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-sm text-gray-600">{review.rating}/5 sao</span>
                      </div>

                      {/* Comment */}
                      <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

                      {/* Metadata */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(review.createdAt)}
                          {review.editCount > 0 && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">Đã chỉnh sửa</span>
                          )}
                        </div>

                        {/* Voucher Info */}
                        {review.voucherGenerated && review.voucherCode && (
                          <div className="flex items-center text-sm text-green-600">
                            <Gift className="w-4 h-4 mr-1" />
                            <span>Nhận voucher: {review.voucherCode}</span>
                          </div>
                        )}
                      </div>

                      {/* Status */}
                      <div className="mt-2">
                        {review.isApproved ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Đã duyệt
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Chờ duyệt
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

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

                  {pagination.totalPages > 5 && pagination.currentPage < pagination.totalPages - 2 && (
                    <>
                      <span className="px-2">...</span>
                      <Button onClick={() => handlePageChange(pagination.totalPages)} variant="outline" size="sm">
                        {pagination.totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={!pagination.hasNext} variant="outline" size="sm">
                  Sau
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
