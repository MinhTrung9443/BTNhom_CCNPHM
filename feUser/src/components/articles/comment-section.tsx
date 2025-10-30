'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { articleService } from '@/services/articleService';
import { Comment } from '@/types/article';
import { CommentItem } from './comment-item';
import { CommentForm } from './comment-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface CommentSectionProps {
  articleId: string;
}

export function CommentSection({ articleId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      const deleteHandler = (data: { commentId: string }) => {
        handleCommentDeleted(data.commentId);
      };
      const updateHandler = (data: { comment: Comment }) => {
        handleCommentUpdated(data.comment);
      };
      const likeHandler = (data: { commentId: string, likes: number }) => {
        handleCommentLikeUpdate(data.commentId, data.likes);
      };

      socket.on('commentDeleted', deleteHandler);
      socket.on('commentUpdated', updateHandler);
      socket.on('commentLikeUpdated', likeHandler);

      return () => {
        socket.off('commentDeleted', deleteHandler);
        socket.off('commentUpdated', updateHandler);
        socket.off('commentLikeUpdated', likeHandler);
      };
    }
  }, [socket]);

  const fetchComments = async (pageNum: number) => {
    setIsLoading(true);
    try {
      const res = await articleService.getComments(articleId, pageNum, 10, session?.user.accessToken);
      console.log('Fetched comments:', res);
      const newComments = res.data;
      setComments((prev) => (pageNum === 1 ? newComments : [...prev, ...newComments]));
      setHasMore(res.meta.hasNext);
    } catch (error) {
      console.error('Failed to fetch comments', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(1);
  }, [articleId, session]);

  // Handler cho highlight và scroll
  const searchParams = useSearchParams();
  useEffect(() => {
    const commentId = searchParams.get('commentId');
    const highlight = searchParams.get('highlight');
    
    if (commentId && comments.length > 0) {
      // Đợi một chút để DOM render xong
      setTimeout(() => {
        const commentElement = document.getElementById(`comment-${commentId}`);
        
        if (commentElement) {
          // Scroll đến comment
          commentElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Thêm class highlight
          commentElement.classList.add('highlight-comment');
          
          // Xóa class sau 3 giây
          setTimeout(() => {
            commentElement.classList.remove('highlight-comment');
          }, 3000);
        }
      }, 500);
    }
  }, [comments, searchParams]);

  const loadMoreComments = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage);
  };

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: loadMoreComments,
    hasMore,
    loading: isLoading,
  });

  const handleCommentAdded = (newComment: Comment) => {
    if (newComment.parentComment) {
      // Add reply to the parent
      setComments(comments.map(c => {
        if (c._id === newComment.parentComment) {
          return { ...c, replies: [...(c.replies || []), newComment] };
        }
        return c;
      }));
    } else {
      // Add new root comment
      setComments([newComment, ...comments]);
    }
  };

  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments(prevComments =>
      prevComments.map(c => {
        if (c._id === updatedComment._id) {
          return updatedComment;
        }
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map(r => r._id === updatedComment._id ? updatedComment : r)
          };
        }
        return c;
      })
    );
  };

  const handleCommentLikeUpdate = (commentId: string, likes: number) => {
    setComments(comments.map(c => {
      if (c._id === commentId) {
        return { ...c, likes };
      }
      if (c.replies) {
        return {
          ...c,
          replies: c.replies.map(r => r._id === commentId ? { ...r, likes } : r)
        };
      }
      return c;
    }));
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments(comments.filter(c => c._id !== commentId).map(c => {
      if (c.replies) {
        return { ...c, replies: c.replies.filter(r => r._id !== commentId) };
      }
      return c;
    }));
  };

  return (
    <section id="comment-section" className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6">Bình luận</h2>
      {session && (
        <CommentForm
          articleId={articleId}
          onCommentAdded={handleCommentAdded}
        />
      )}
      <div className="mt-8 space-y-6">
        {isLoading && comments.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : (
          comments.map((comment, index) => (
            <div 
              key={comment._id} 
              id={`comment-${comment._id}`}
              ref={index === comments.length - 1 ? loadMoreRef : null}
            >
              <CommentItem
                articleId={articleId}
                comment={comment}
                onCommentUpdated={handleCommentUpdated}
                onCommentDeleted={handleCommentDeleted}
                onReplyAdded={handleCommentAdded}
              />
            </div>
          ))
        )}
        {!isLoading && hasMore && (
          <div className="text-center">
            <Button onClick={loadMoreComments}>Tải thêm bình luận</Button>
          </div>
        )}
      </div>
    </section>
  );
}
