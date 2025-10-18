import { useState, useEffect, useCallback } from "react";
import { articleService } from "@/services/articleService";
import { Comment } from "@/types/article";
import { useSession } from "next-auth/react";
import { useArticleRealtime } from "./use-article-realtime";

export function useComments(articleId: string) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Helper function to update comment in nested structure
  const updateCommentInList = useCallback((commentId: string, updater: (comment: Comment) => Comment) => {
    setComments((prev) => {
      const updateNested = (comments: Comment[]): Comment[] => {
        return comments.map((comment) => {
          if (comment._id === commentId) {
            return updater(comment);
          }
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateNested(comment.replies),
            };
          }
          return comment;
        });
      };
      return updateNested(prev);
    });
  }, []);

  // Set up real-time updates for comments
  useArticleRealtime(articleId, {
    onNewComment: (data) => {
      // Refresh comments to show the new one
      refresh();
    },
    onCommentUpdate: (data) => {
      updateCommentInList(data.commentId, (comment) => ({
        ...comment,
        content: data.content,
        isEdited: data.isEdited,
        editedAt: new Date(data.editedAt).toISOString(),
      }));
    },
    onCommentLikeUpdate: (data) => {
      updateCommentInList(data.commentId, (comment) => ({
        ...comment,
        likes: data.likes,
      }));
    },
    onCommentDelete: (data) => {
      // Remove the comment from the list
      setComments((prev) => prev.filter((comment) => comment._id !== data.commentId));
    },
  });

  const fetchComments = useCallback(
    async (pageNum: number, append: boolean = false) => {
      try {
        setLoading(true);
        setError(null);

        const response = await articleService.getComments(
          articleId,
          pageNum,
          10,
          session?.user?.accessToken
        );
        console.log("Fetched comments:", response);

        const newComments = response.data;
        setComments((prev) =>
          append ? [...prev, ...newComments] : newComments
        );
        setHasMore(response.meta.currentPage < response.meta.totalPages);
      } catch (err: any) {
        setError(err.response?.data?.message || "Không thể tải bình luận");
      } finally {
        setLoading(false);
      }
    },
    [articleId, session?.user?.accessToken]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchComments(nextPage, true);
    }
  }, [loading, hasMore, page, fetchComments]);

  const refresh = useCallback(() => {
    setPage(1);
    fetchComments(1, false);
  }, [fetchComments]);

  const addComment = useCallback(
    async (content: string, parentCommentId: string | null = null) => {
      if (!session?.user?.accessToken) {
        throw new Error("Vui lòng đăng nhập để bình luận");
      }

      const response = await articleService.createComment(
        articleId,
        content,
        parentCommentId,
        session.user.accessToken
      );

      if (response.success && response.data) {
        // Refresh comments to show the new one
        refresh();
        return response.data;
      }
    },
    [articleId, session?.user?.accessToken, refresh]
  );

  const updateComment = useCallback(
    async (commentId: string, content: string) => {
      if (!session?.user?.accessToken) {
        throw new Error("Vui lòng đăng nhập");
      }

      const response = await articleService.updateComment(
        commentId,
        content,
        session.user.accessToken
      );

      if (response.success && response.data) {
        // Update the comment in the list
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentId ? response.data! : comment
          )
        );
        return response.data;
      }
    },
    [session?.user?.accessToken]
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      if (!session?.user?.accessToken) {
        throw new Error("Vui lòng đăng nhập");
      }

      await articleService.deleteComment(commentId, session.user.accessToken);

      // Remove the comment from the list
      setComments((prev) => prev.filter((comment) => comment._id !== commentId));
    },
    [session?.user?.accessToken]
  );

  const toggleLike = useCallback(
    async (commentId: string) => {
      if (!session?.user?.accessToken) {
        throw new Error("Vui lòng đăng nhập để thích bình luận");
      }

      const response = await articleService.toggleCommentLike(
        commentId,
        session.user.accessToken
      );

      if (response.success && response.data) {
        // Update the comment's like status
        setComments((prev) =>
          prev.map((comment) => {
            if (comment._id === commentId) {
              return {
                ...comment,
                likes: response.data!.likes,
                userInteraction: {
                  ...comment.userInteraction!,
                  hasLiked: response.data!.liked,
                },
              };
            }
            return comment;
          })
        );
      }
    },
    [session?.user?.accessToken]
  );

  useEffect(() => {
    if (articleId) {
      fetchComments(1, false);
    }
  }, [articleId, fetchComments]);

  return {
    comments,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    addComment,
    updateComment,
    deleteComment,
    toggleLike,
  };
}
