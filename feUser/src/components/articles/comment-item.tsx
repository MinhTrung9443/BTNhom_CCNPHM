'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ThumbsUp, MessageSquare, Edit, Trash2 } from 'lucide-react';
import { Comment } from '@/types/article';
import { UserAvatar } from '@/components/user-avatar';
import { useToast } from '@/hooks/use-toast';
import { articleService } from '@/services/articleService';
import { CommentForm } from './comment-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface CommentItemProps {
  comment: Comment;
  articleId: string;
  onCommentUpdated: (comment: Comment) => void;
  onCommentDeleted: (commentId: string) => void;
  onReplyAdded: (reply: Comment) => void;
}

export function CommentItem({
  comment,
  articleId,
  onCommentUpdated,
  onCommentDeleted,
  onReplyAdded,
}: CommentItemProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLiked, setIsLiked] = useState(comment.userInteraction?.hasLiked || false);
  const [likeCount, setLikeCount] = useState(comment.likes);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setIsLiked(comment.userInteraction?.hasLiked || false);
    setLikeCount(comment.likes);
  }, [comment]);

  const canEdit = session?.user?.id === comment.author._id;
  const canDelete = session?.user?.id === comment.author._id || session?.user?.role === 'admin';

  const handleLike = async () => {
    if (!session) return;
    try {
      const response = await articleService.toggleCommentLike(comment._id, session.user.accessToken);
      setIsLiked(response.data.liked);
      setLikeCount(response.data.likes);
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể thích bình luận.', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!session) return;
    try {
      await articleService.deleteComment(comment._id, session.user.accessToken);
      onCommentDeleted(comment._id);
      toast({ title: 'Đã xóa bình luận' });
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể xóa bình luận.', variant: 'destructive' });
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleUpdate = (updatedComment: Comment) => {
    onCommentUpdated(updatedComment);
    setIsEditing(false);
  };

  return (
    <div className="flex space-x-4">
      <UserAvatar
        session={{
          user: {
            name: comment.author.name,
            avatar: comment.author.avatar,
            id: comment.author._id,
            email: '',
            role: '',
            accessToken: '',
          },
          expires: '',
        }}
        className="w-10 h-10"
      />
      <div className="flex-1">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              {comment.author.name}
              {comment.author.isAdmin && (
                <span className="ml-2 text-xs text-primary font-bold">[Admin]</span>
              )}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: vi,
              })}
            </span>
          </div>
          {isEditing ? (
            <CommentForm
              articleId={articleId}
              parentCommentId={comment.parentComment}
              commentId={comment._id}
              onCommentAdded={handleUpdate}
              onCancel={() => setIsEditing(false)}
              isReply={!!comment.parentComment}
              initialContent={comment.content}
            />
          ) : (
            <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{comment.content}</p>
          )}
        </div>
        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
          <button onClick={handleLike} className={`flex items-center space-x-1 hover:text-blue-600 ${isLiked ? 'text-blue-600 font-semibold' : ''}`}>
            <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likeCount} Thích</span>
          </button>
          <button onClick={() => setIsReplying(!isReplying)} className="flex items-center space-x-1 hover:text-primary">
            <MessageSquare className="w-3 h-3" />
            <span>Trả lời</span>
          </button>
          {canEdit && (
            <button onClick={() => setIsEditing(true)} className="flex items-center space-x-1 hover:text-primary">
              <Edit className="w-3 h-3" />
              <span>Sửa</span>
            </button>
          )}
          {canDelete && (
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <AlertDialogTrigger asChild>
                <button className="flex items-center space-x-1 hover:text-destructive">
                  <Trash2 className="w-3 h-3" />
                  <span>Xóa</span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa bình luận?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này không thể hoàn tác. Bình luận này sẽ bị xóa vĩnh viễn.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Xóa</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        {isReplying && (
          <div className="mt-4">
            <CommentForm
              articleId={articleId}
              parentCommentId={comment._id}
              onCommentAdded={(reply) => {
                onReplyAdded(reply);
                setIsReplying(false);
              }}
              onCancel={() => setIsReplying(false)}
              isReply
            />
          </div>
        )}
        <div className="mt-4 space-y-4 pl-8 border-l-2 border-gray-200 dark:border-gray-700">
          {comment.replies?.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              articleId={articleId}
              onCommentUpdated={onCommentUpdated}
              onCommentDeleted={onCommentDeleted}
              onReplyAdded={onReplyAdded}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
