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
      // Add the new comment directly instead of refreshing
      // This allows pending comments to show immediately for the author
      if (data.comment) {
        setComments((prev) => [data.comment, ...prev]);
      }
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
    onCommentStatusUpdate: (data) => {
      // Update the comment status in the list
      console.log('[Comment] Status update:', data);
      updateCommentInList(data.commentId, (comment) => ({
        ...comment,
        status: data.status as 'pending' | 'approved' | 'rejected'
      }));
      
      // If status changed from pending to approved/rejected, trigger a refresh
      // to ensure proper positioning and visibility
      if (data.status !== 'pending') {
        setTimeout(() => refresh(), 500); // Small delay to ensure UI updates
      }
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
        const newComment = response.data;
        
        // Submit to n8n for moderation (only if pending - user comment)
        if (newComment.status === 'pending') {
          try {
            await articleService.submitCommentModeration(
              newComment._id,
              session.user.accessToken
            );
            console.log('[Comment] Submitted to n8n for moderation');
          } catch (error) {
            console.error('[Comment] Failed to submit moderation:', error);
            // Don't throw - comment already created, moderation can be done manually
          }
        }
        
        // Refresh comments to show the new one (only approved will show)
        refresh();
        return newComment;
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
        const updatedComment = response.data;
        
        // Submit to n8n for moderation (only if pending - user comment)
        if (updatedComment.status === 'pending') {
          try {
            await articleService.submitCommentModeration(
              updatedComment._id,
              session.user.accessToken
            );
            console.log('[Comment] Updated comment submitted to n8n for moderation');
          } catch (error) {
            console.error('[Comment] Failed to submit moderation:', error);
          }
          
          // Remove from UI since it's pending now
          setComments((prev) => prev.filter((comment) => comment._id !== commentId));
        } else {
          // Update the comment in the list (if still approved)
          setComments((prev) =>
            prev.map((comment) =>
              comment._id === commentId ? updatedComment : comment
            )
          );
        }
        
        return updatedComment;
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
