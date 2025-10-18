import { useState, useCallback, useEffect } from "react";
import { articleService } from "@/services/articleService";
import { useSession } from "next-auth/react";
import { useArticleRealtime } from "./use-article-realtime";

export function useArticleLike(articleId: string, initialLiked: boolean = false, initialCount: number = 0) {
  const { data: session } = useSession();
  const [hasLiked, setHasLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialCount);
  const [isLiking, setIsLiking] = useState(false);

  // Set up real-time updates for article likes
  useArticleRealtime(articleId, {
    onArticleLikeUpdate: (data) => {
      setLikesCount(data.likes);
    },
  });

  const toggleLike = useCallback(async () => {
    if (!session?.user.accessToken) {
      throw new Error("Vui lòng đăng nhập để thích bài viết");
    }

    if (isLiking) return;

    setIsLiking(true);
    try {
      const response = await articleService.toggleArticleLike(
        articleId,
        session.user.accessToken
      );

      if (response.success && response.data) {
        setHasLiked(response.data.liked);
        setLikesCount(response.data.likes);
      }
    } finally {
      setIsLiking(false);
    }
  }, [articleId, session?.user.accessToken, isLiking]);

  return {
    hasLiked,
    likesCount,
    isLiking,
    toggleLike,
  };
}
