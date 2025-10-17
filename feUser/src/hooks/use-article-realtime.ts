import { useEffect, useCallback } from "react";
import { useSocket } from "./useSocket";

interface ArticleLikeUpdate {
  articleId: string;
  likes: number;
}

interface CommentLikeUpdate {
  commentId: string;
  likes: number;
  articleId: string;
}

interface NewComment {
  comment: any;
  articleId: string;
}

interface CommentUpdate {
  commentId: string;
  content: string;
  isEdited: boolean;
  editedAt: Date;
  articleId: string;
}

interface CommentDelete {
  commentId: string;
  articleId: string;
  deletedCount: number;
}

interface ArticleRealtimeCallbacks {
  onArticleLikeUpdate?: (data: ArticleLikeUpdate) => void;
  onCommentLikeUpdate?: (data: CommentLikeUpdate) => void;
  onNewComment?: (data: NewComment) => void;
  onCommentUpdate?: (data: CommentUpdate) => void;
  onCommentDelete?: (data: CommentDelete) => void;
}

/**
 * Hook for handling real-time article updates via Socket.IO
 * @param articleId - The article ID to subscribe to
 * @param callbacks - Callback functions for different real-time events
 */
export function useArticleRealtime(
  articleId: string | null,
  callbacks: ArticleRealtimeCallbacks
) {
  const { socket, isConnected } = useSocket();

  // Join article room when connected
  useEffect(() => {
    if (!socket || !isConnected || !articleId) return;

    socket.emit("joinArticle", articleId);

    return () => {
      socket.emit("leaveArticle", articleId);
    };
  }, [socket, isConnected, articleId]);

  // Set up event listeners
  useEffect(() => {
    if (!socket || !articleId) return;

    const handleArticleLikeUpdate = (data: ArticleLikeUpdate) => {
      if (data.articleId === articleId && callbacks.onArticleLikeUpdate) {
        callbacks.onArticleLikeUpdate(data);
      }
    };

    const handleCommentLikeUpdate = (data: CommentLikeUpdate) => {
      if (data.articleId === articleId && callbacks.onCommentLikeUpdate) {
        callbacks.onCommentLikeUpdate(data);
      }
    };

    const handleNewComment = (data: NewComment) => {
      if (data.articleId === articleId && callbacks.onNewComment) {
        callbacks.onNewComment(data);
      }
    };

    const handleCommentUpdate = (data: CommentUpdate) => {
      if (data.articleId === articleId && callbacks.onCommentUpdate) {
        callbacks.onCommentUpdate(data);
      }
    };

    const handleCommentDelete = (data: CommentDelete) => {
      if (data.articleId === articleId && callbacks.onCommentDelete) {
        callbacks.onCommentDelete(data);
      }
    };

    socket.on("articleLikeUpdated", handleArticleLikeUpdate);
    socket.on("commentLikeUpdated", handleCommentLikeUpdate);
    socket.on("newComment", handleNewComment);
    socket.on("commentUpdated", handleCommentUpdate);
    socket.on("commentDeleted", handleCommentDelete);

    return () => {
      socket.off("articleLikeUpdated", handleArticleLikeUpdate);
      socket.off("commentLikeUpdated", handleCommentLikeUpdate);
      socket.off("newComment", handleNewComment);
      socket.off("commentUpdated", handleCommentUpdate);
      socket.off("commentDeleted", handleCommentDelete);
    };
  }, [socket, articleId, callbacks]);

  return {
    isConnected,
  };
}
