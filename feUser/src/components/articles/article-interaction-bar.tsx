'use client';

import { useState } from 'react';
import { ThumbsUp, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArticleDetailResponse } from '@/types/article';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { articleService } from '@/services/articleService';
import { ArticleShareButtons } from './article-share-buttons';

interface ArticleInteractionBarProps {
  article: ArticleDetailResponse;
}

export function ArticleInteractionBar({ article }: ArticleInteractionBarProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(article.userInteraction?.hasLiked || false);
  const [likeCount, setLikeCount] = useState(article.stats.likes);
  const [showShare, setShowShare] = useState(false);

  const handleLike = async () => {
    if (!session) {
      toast({
        title: 'Yêu cầu đăng nhập',
        description: 'Bạn cần đăng nhập để thích bài viết.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const response = await articleService.toggleArticleLike(article._id, session.user.accessToken);
      setIsLiked(response.data.liked);
      setLikeCount(response.data.likes);
      toast({
        title: response.data.liked ? 'Đã thích bài viết' : 'Đã bỏ thích bài viết',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể thực hiện thao tác. Vui lòng thử lại.',
        variant: 'destructive',
      });
    }
  };

  const handleCommentClick = () => {
    document.getElementById('comment-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex items-center justify-around border-t border-b border-gray-200 dark:border-gray-700 my-6 py-3">
      <Button
        variant="ghost"
        className={`flex items-center space-x-2 ${isLiked ? 'text-blue-600 font-semibold' : ''}`}
        onClick={handleLike}
      >
        <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current text-blue-600' : ''}`} />
        <span>{likeCount.toLocaleString()} Thích</span>
      </Button>
      <Button variant="ghost" className="flex items-center space-x-2" onClick={handleCommentClick}>
        <MessageCircle className="w-5 h-5" />
        <span>Bình luận</span>
      </Button>
      <div className="relative">
        <Button variant="ghost" className="flex items-center space-x-2" onClick={() => setShowShare(!showShare)}>
          <Share2 className="w-5 h-5" />
          <span>Chia sẻ</span>
        </Button>
        {showShare && (
          <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2">
            <ArticleShareButtons articleUrl={typeof window !== 'undefined' ? window.location.href : ''} articleTitle={article.title} onShare={() => setShowShare(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
