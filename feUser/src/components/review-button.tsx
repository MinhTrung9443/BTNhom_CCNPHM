"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Star, Edit3 } from "lucide-react";
import { ReviewForm } from "@/components/review-form";
import { reviewService, ExistingReview } from "@/services/reviewService";

interface ReviewButtonProps {
  product: {
    id: string;
    name: string;
    image: string;
  };
  orderId: string;
}

export function ReviewButton({ product, orderId }: ReviewButtonProps) {
  const { data: session } = useSession();
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [existingReview, setExistingReview] = useState<ExistingReview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check for existing review when component mounts
  useEffect(() => {
    const checkExistingReview = async () => {
      if (!isMounted || !session?.user?.accessToken) return;

      setIsLoading(true);
      try {
        const result = await reviewService.getExistingReview(product.id, orderId, session.user.accessToken);

        if (result.success && result.data) {
          setExistingReview(result.data.data);
          console.log("Review updated:", result.data.data);
        }
      } catch (error) {
        console.error("Error checking existing review:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingReview();
  }, [product.id, orderId, session?.user?.accessToken, isMounted]);

  const handleClick = () => {
    setIsReviewFormOpen(true);
  };

  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <Button size="sm" variant="outline" className="gap-2" disabled>
        <Star className="w-4 h-4" />
        Đang tải...
      </Button>
    );
  }

  const handleReviewUpdated = () => {
    if (session?.user?.accessToken) {
      reviewService.getExistingReview(product.id, orderId, session.user.accessToken).then((result) => {
        if (result.success && result.data) {
          setExistingReview(result.data.data);
        }
      });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className={`w-3 h-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        ))}
      </div>
    );
  };

  return (
    <>
      {isMounted && existingReview ? (
        <div className="space-y-2">
          {/* Display existing review info */}
          <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            {renderStars(existingReview.rating)}
            <span className="text-sm text-gray-600">
              "{(existingReview.comment || "").length > 30 ? (existingReview.comment || "").substring(0, 30) + "..." : existingReview.comment || ""}"
            </span>
          </div>

          {/* Check if already edited */}
          {existingReview.editCount >= 1 ? (
            <div className="p-3 bg-gray-100 border border-gray-300 rounded-md">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium">Bạn đã chỉnh sửa đánh giá này rồi</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClick}
                disabled={isLoading}
                className="w-full text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 border-yellow-200"
              >
                {isLoading ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600 mr-1" /> : <Edit3 className="h-3 w-3 mr-1" />}
                Chỉnh sửa đánh giá
              </Button>
              <p className="text-xs text-amber-600 text-center">⚠️ Chỉ được sửa 1 lần</p>
            </div>
          )}
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={isLoading || !isMounted}
          className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 border-yellow-200"
        >
          {isLoading ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600 mr-1" /> : <Star className="h-3 w-3 mr-1" />}
          {!isMounted ? "Đang tải..." : "Đánh giá"}
        </Button>
      )}

      {isMounted && (!existingReview || existingReview.editCount < 1) && (
        <ReviewForm
          isOpen={isReviewFormOpen}
          onClose={() => setIsReviewFormOpen(false)}
          product={product}
          orderId={orderId}
          existingReview={existingReview}
          onReviewUpdated={handleReviewUpdated}
        />
      )}
    </>
  );
}
