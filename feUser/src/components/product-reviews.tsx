"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { reviewService, Review, ReviewsResponse } from "@/services/reviewService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Star, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { data: session } = useSession();
  const [reviewsData, setReviewsData] = useState<ReviewsResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchReviews = async (page: number = 1) => {
    setLoading(true);
    try {
      console.log("Fetching reviews for productId:", productId, "page:", page);
      const response = await reviewService.getProductReviews(productId, page, 10, session?.user?.accessToken);
      console.log("Reviews response:", response);

      if (response.success) {
        setReviewsData(response.data);
        console.log("Reviews data set:", response.data);
      } else {
        console.log("Reviews fetch failed:", response.message);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(currentPage);
  }, [productId, currentPage, session?.user?.accessToken]);

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "sm") => {
    const starSize = size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-6 h-6";

    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className={`${starSize} ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 5:
        return "Rất hài lòng";
      case 4:
        return "Hài lòng";
      case 3:
        return "Bình thường";
      case 2:
        return "Không hài lòng";
      case 1:
        return "Rất không hài lòng";
      default:
        return "";
    }
  };

  if (loading && !reviewsData) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!reviewsData || reviewsData.reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có đánh giá nào</h3>
        <p className="text-gray-500">Hãy là người đầu tiên đánh giá sản phẩm này</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Đánh giá sản phẩm ({reviewsData.summary.totalReviews})</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-500 mb-2">{reviewsData.summary.averageRating.toFixed(1)}</div>
            <div className="flex justify-center mb-2">{renderStars(Math.floor(reviewsData.summary.averageRating), "md")}</div>
            <p className="text-gray-600">{reviewsData.summary.totalReviews} đánh giá</p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviewsData.summary.ratingDistribution[star as keyof typeof reviewsData.summary.ratingDistribution];
              const percentage = reviewsData.summary.totalReviews > 0 ? (count / reviewsData.summary.totalReviews) * 100 : 0;

              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1 w-8">
                    <span className="text-sm font-medium">{star}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <Progress value={percentage} className="flex-1 h-2" />
                  <span className="text-gray-600 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Tất cả đánh giá</h3>

        {reviewsData.reviews.map((review: Review) => (
          <div key={review._id} className="border rounded-lg p-4 bg-white">
            {/* Review Header */}
            <div className="flex items-start gap-3 mb-3">
              <Avatar className="w-10 h-10">
                <AvatarImage 
                  src={
                    review.userId.avatar
                      ? review.userId.avatar.startsWith('http')
                        ? review.userId.avatar
                        : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "http://localhost:5000"}${review.userId.avatar}`
                      : ""
                  }
                />
                <AvatarFallback className="bg-blue-500 text-white">{review.userId.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{review.userId.name}</h4>
                  <div className="flex items-center gap-2">
                    {review.editCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Đã chỉnh sửa
                      </Badge>
                    )}
                    <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  {renderStars(review.rating)}
                  <span className="text-sm font-medium text-yellow-600">{getRatingLabel(review.rating)}</span>
                </div>
              </div>
            </div>

            {/* Review Content */}
            <div className="ml-13">
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>

              {!review.isApproved && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">⏳ Đánh giá đang chờ duyệt</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {reviewsData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={!reviewsData.pagination.hasPrev || loading}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Trước
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, reviewsData.pagination.totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  disabled={loading}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={!reviewsData.pagination.hasNext || loading}>
            Sau
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
