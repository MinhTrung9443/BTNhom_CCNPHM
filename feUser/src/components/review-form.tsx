"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { reviewService, ExistingReview } from "@/services/reviewService";

interface ReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    image: string;
  };
  orderId: string;
  deliveredAt?: string;
  existingReview?: ExistingReview | null;
  onReviewUpdated?: () => void;
}

export function ReviewForm({ isOpen, onClose, product, orderId, deliveredAt, existingReview, onReviewUpdated }: ReviewFormProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update form when existingReview changes
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    } else {
      setRating(0);
      setComment("");
    }
  }, [existingReview]);

  const handleSubmit = async () => {
    // Prevent submission if already submitting
    if (isSubmitting) {
      return;
    }

    if (!session?.user?.accessToken) {
      toast.error("Vui lòng đăng nhập để đánh giá!");
      return;
    }

    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá!");
      return;
    }

    const trimmedComment = (comment || "").trim();
    if (trimmedComment.length === 0) {
      toast.error("Vui lòng nhập bình luận của bạn!");
      return;
    }

    setIsSubmitting(true);

    try {
      let result;

      if (existingReview) {
        // Update existing review
        result = await reviewService.updateReview(
          {
            reviewId: existingReview._id,
            rating,
            comment: trimmedComment,
          },
          session.user.accessToken
        );
      } else {
        // Create new review
        result = await reviewService.createReview(
          {
            productId: product.id,
            orderId,
            rating,
            comment: trimmedComment,
          },
          session.user.accessToken
        );
      }

      if (result.success) {
        // Hiển thị thông báo về đánh giá
        toast.success(result.message);

        // Hiển thị thông báo về mã giảm giá nếu có
        if (result.data && result.data.voucherEligibilityMessage) {
          if (result.data.isEligibleForVoucher) {
            toast.success(result.data.voucherEligibilityMessage, { duration: 5000 });
          } else {
            toast.info(result.data.voucherEligibilityMessage, { duration: 5000 });
          }
        }

        if (onReviewUpdated) {
          onReviewUpdated();
        }
        handleClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Có lỗi xảy ra khi ${existingReview ? "cập nhật" : "gửi"} đánh giá. Vui lòng thử lại!`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!existingReview) {
      setRating(0);
      setComment("");
    }
    setHoverRating(0);
    setIsSubmitting(false);
    onClose();
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const filled = starValue <= (hoverRating || rating);

      return (
        <button
          key={index}
          type="button"
          className={cn("transition-colors duration-150", filled ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300")}
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => setRating(starValue)}
        >
          <Star className={cn("h-8 w-8", filled ? "fill-current" : "fill-none")} />
        </button>
      );
    });
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1:
        return "Rất tệ";
      case 2:
        return "Tệ";
      case 3:
        return "Bình thường";
      case 4:
        return "Tốt";
      case 5:
        return "Rất tốt";
      default:
        return "Chưa đánh giá";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl">{existingReview ? "Chỉnh sửa đánh giá" : "Đánh giá sản phẩm"}</DialogTitle>
          <DialogDescription>
            {existingReview ? "Cập nhật đánh giá và chia sẻ thêm trải nghiệm của bạn" : "Chia sẻ trải nghiệm của bạn về sản phẩm này"}
          </DialogDescription>

          {/* Thông báo về mã giảm giá cho đánh giá mới */}
          {!existingReview &&
            (() => {
              if (!deliveredAt) {
                return null;
              }

              const deliveryDate = new Date(deliveredAt);
              const deadlineDate = new Date(deliveryDate.getTime() + 30 * 24 * 60 * 60 * 1000);
              const now = new Date();
              const daysRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const isEligible = daysRemaining > 0;

              const formatDate = (date: Date) => {
                return date.toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
              };

              if (isEligible) {
                return (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">🎁 Nhận mã giảm giá khi đánh giá</p>
                        <p className="text-sm text-green-700 mt-1">
                          Bạn sẽ nhận được <span className="font-semibold">mã giảm giá 5%</span> (tối đa 50.000đ) khi đánh giá.
                        </p>
                        <div className="mt-2 pt-2 border-t border-green-200">
                          <p className="text-xs text-green-800">
                            📅 <span className="font-semibold">Ngày nhận hàng:</span> {formatDate(deliveryDate)}
                          </p>
                          <p className="text-xs text-green-800 mt-1">
                            ⏰ <span className="font-semibold">Hạn đánh giá:</span> {formatDate(deadlineDate)}
                          </p>
                          <p className="text-xs font-semibold text-green-900 mt-1">
                            ⚡ Còn <span className="text-base">{daysRemaining}</span> ngày để nhận voucher!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-800">⚠️ Đã hết hạn nhận mã giảm giá</p>
                        <p className="text-sm text-amber-700 mt-1">Rất tiếc, bạn đã quá thời hạn 30 ngày để nhận mã giảm giá.</p>
                        <div className="mt-2 pt-2 border-t border-amber-200">
                          <p className="text-xs text-amber-700">
                            📅 <span className="font-semibold">Ngày nhận hàng:</span> {formatDate(deliveryDate)}
                          </p>
                          <p className="text-xs text-amber-700 mt-1">
                            ⏰ <span className="font-semibold">Hạn đã kết thúc:</span> {formatDate(deadlineDate)}
                          </p>
                        </div>
                        <p className="text-xs text-amber-600 mt-2 italic">Tuy nhiên, đánh giá của bạn vẫn rất quan trọng để giúp người mua khác!</p>
                      </div>
                    </div>
                  </div>
                );
              }
            })()}

          {/* Thông báo cho việc chỉnh sửa */}
          {existingReview && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">Lưu ý quan trọng</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Bạn chỉ được chỉnh sửa đánh giá <span className="font-semibold">1 lần duy nhất</span>. Vui lòng kiểm tra kỹ trước khi cập nhật.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Product Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{product.name}</h4>
              <p className="text-xs text-muted-foreground">Mã đơn hàng: {orderId.slice(-8).toUpperCase()}</p>
              {existingReview && (
                <p className="text-xs text-blue-600 mt-1">Đã đánh giá: {new Date(existingReview.createdAt).toLocaleDateString("vi-VN")}</p>
              )}
            </div>
          </div>

          {/* Rating Section */}
          <div className="text-center space-y-3">
            <Label className="text-base font-medium">
              Đánh giá của bạn <span className="text-red-500">*</span>:{" "}
              <span className="text-yellow-600 font-semibold">{getRatingText(hoverRating || rating)}</span>
            </Label>
            <div className="flex justify-center gap-1 p-4 bg-gray-50 rounded-lg">{renderStars()}</div>
            {rating > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="flex gap-1">
                  {Array.from({ length: rating }, (_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span>({rating}/5 sao)</span>
              </div>
            )}
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-base font-medium">
              Bình luận của bạn <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="comment"
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[50px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-end text-xs">
              <span className={cn("transition-colors", (comment || "").length > 450 ? "text-orange-500" : "text-muted-foreground")}>
                {(comment || "").length}/500
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {existingReview ? "Đang cập nhật..." : "Đang gửi..."}
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {existingReview ? "Cập nhật đánh giá" : "Gửi đánh giá"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
