'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { articleService } from '@/services/articleService';
import { Comment } from '@/types/article';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/user-avatar';

interface CommentFormProps {
  articleId: string;
  parentCommentId?: string | null;
  commentId?: string;
  onCommentAdded: (comment: Comment) => void;
  onCancel?: () => void;
  isReply?: boolean;
  initialContent?: string;
}

export function CommentForm({
  articleId,
  parentCommentId = null,
  onCommentAdded,
  onCancel,
  commentId,
  isReply = false,
  initialContent = '',
}: CommentFormProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !session) return;

    setIsSubmitting(true);
    try {
      let response;
      if (commentId) {
        response = await articleService.updateComment(
          commentId,
          content,
          session.user.accessToken
        );
        
        if (response.data?.status === 'pending') {
          toast({ 
            title: 'Bình luận đã được gửi',
            description: 'Vui lòng đợi kết quả kiểm duyệt. Bạn sẽ nhận được thông báo khi có kết quả.',
          });
        } else {
          toast({ title: 'Bình luận của bạn đã được cập nhật' });
        }
      } else {
        response = await articleService.createComment(
          articleId,
          content,
          parentCommentId,
          session.user.accessToken
        );
        
        if (response.data?.status === 'pending') {
          toast({ 
            title: 'Bình luận đã được gửi',
            description: 'Vui lòng đợi kết quả kiểm duyệt. Bạn sẽ nhận được thông báo khi có kết quả.',
          });
        } else {
          toast({ title: 'Bình luận của bạn đã được đăng' });
        }
        
        // Submit to n8n if pending (handled in hook, but also do here if needed)
        if (response.data?.status === 'pending') {
          try {
            await articleService.submitCommentModeration(
              response.data._id,
              session.user.accessToken
            );
          } catch (error) {
            console.error('[Comment] Failed to submit moderation:', error);
          }
        }
      }
      
      // Add comment to UI immediately (including pending comments)
      // Pending comments will be visible to the author with a processing indicator
      onCommentAdded(response.data);
      
      setContent('');
      if (onCancel) onCancel();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi bình luận. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) return null;

  return (
    <form onSubmit={handleSubmit} className={`flex items-start space-x-4 ${isReply ? 'mt-4' : ''}`}>
      <UserAvatar session={session} className="w-10 h-10" />
      <div className="flex-1">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isReply ? 'Viết câu trả lời của bạn...' : 'Viết bình luận của bạn...'}
          className="w-full"
          rows={isReply ? 2 : 3}
        />
        <div className="mt-2 flex justify-end space-x-2">
          {isReply && onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Hủy
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? (commentId ? 'Đang cập nhật...' : 'Đang gửi...') : (commentId ? 'Cập nhật' : 'Gửi bình luận')}
          </Button>
        </div>
      </div>
    </form>
  );
}
