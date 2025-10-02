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
  existingReview?: ExistingReview | null;
  onReviewUpdated?: () => void;
}

export function ReviewForm({ isOpen, onClose, product, orderId, existingReview, onReviewUpdated }: ReviewFormProps) {
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
    if (!session?.user?.accessToken) {
      toast.error("Vui lòng đăng nhập để đánh giá!");
      return;
    }

    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá!");
      return;
    }

    const trimmedComment = (comment || "").trim();
    if (trimmedComment.length < 10) {
      toast.error("Bình luận phải có ít nhất 10 ký tự!");
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
        toast.success(result.message);
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{existingReview ? "Chỉnh sửa đánh giá" : "Đánh giá sản phẩm"}</DialogTitle>
          <DialogDescription>
            {existingReview ? "Cập nhật đánh giá và chia sẻ thêm trải nghiệm của bạn" : "Chia sẻ trải nghiệm của bạn về sản phẩm này"}
          </DialogDescription>
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
              Đánh giá của bạn: <span className="text-yellow-600 font-semibold">{getRatingText(hoverRating || rating)}</span>
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
              Bình luận của bạn
            </Label>
            <Textarea
              id="comment"
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này... (tối thiểu 10 ký tự)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between text-xs">
              <span className={cn("transition-colors", (comment || "").trim().length < 10 ? "text-red-500" : "text-muted-foreground")}>
                Tối thiểu 10 ký tự {(comment || "").trim().length < 10 && `(còn ${10 - (comment || "").trim().length})`}
              </span>
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
          <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0} className="min-w-[120px]">
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
