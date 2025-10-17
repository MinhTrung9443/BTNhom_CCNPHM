"use client";

import { useArticleLike } from "@/hooks/use-article-like";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface ArticleLikeButtonProps {
  articleId: string;
  initialLiked?: boolean;
  initialCount?: number;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showCount?: boolean;
}

export function ArticleLikeButton({
  articleId,
  initialLiked = false,
  initialCount = 0,
  variant = "outline",
  size = "default",
  showCount = true,
}: ArticleLikeButtonProps) {
  const { status } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const { hasLiked, likesCount, isLiking, toggleLike } = useArticleLike(
    articleId,
    initialLiked,
    initialCount
  );

  const handleClick = async () => {
    if (status === "unauthenticated") {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để thích bài viết",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    try {
      await toggleLike();
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Không thể thích bài viết",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLiking}
      className={cn(
        "transition-all",
        hasLiked && "text-red-500 hover:text-red-600"
      )}
    >
      <Heart
        className={cn(
          "w-5 h-5",
          showCount && "mr-2",
          hasLiked && "fill-current"
        )}
      />
      {showCount && <span>{likesCount}</span>}
    </Button>
  );
}
