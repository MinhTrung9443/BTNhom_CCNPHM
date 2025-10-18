'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ThumbsUp, MessageCircle, Share2 } from 'lucide-react';
import { Article } from '@/types/article';
import { useToast } from '@/hooks/use-toast';
import { articleService } from '@/services/articleService';
import Link from 'next/link';

interface ArticleCardInteractionProps {
  article: Article;
}

export function ArticleCardInteraction({ article }: ArticleCardInteractionProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(article.userInteraction?.hasLiked || false);
  const [likeCount, setLikeCount] = useState(article.stats.likes);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to article detail
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
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể thực hiện thao tác. Vui lòng thử lại.',
        variant: 'destructive',
      });
    }
  };
  
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  return (
    <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
            <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 hover:text-blue-600 transition-colors ${isLiked ? 'text-blue-600 font-semibold' : ''}`}
            >
                <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{formatNumber(likeCount)} Thích</span>
            </button>
            <Link href={`/bai-viet/${article.slug}#comment-section`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>{formatNumber(article.stats.comments)} Bình luận</span>
            </Link>
        </div>
        <div className="flex items-center gap-1.5">
            <Share2 className="w-4 h-4" />
            <span>{formatNumber(article.stats.shares)} Chia sẻ</span>
        </div>
    </div>
  );
}