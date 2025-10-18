'use client';

import { ArticleDetailResponse } from '@/types/article';
import Image from 'next/image';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar, Eye, MessageCircle, Share2, ThumbsUp } from 'lucide-react';

interface ArticleDetailProps {
  article: ArticleDetailResponse;
}

export function ArticleDetail({ article }: ArticleDetailProps) {
  return (
    <>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {article.title}
      </h1>
      <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mb-6 space-x-4">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1.5" />
          <span>
            {format(new Date(article.publishedAt), 'd MMMM, yyyy', {
              locale: vi,
            })}
          </span>
        </div>
        <div className="flex items-center">
          <Eye className="w-4 h-4 mr-1.5" />
          <span>{article.stats.views.toLocaleString()} lượt xem</span>
        </div>
        <div className="flex items-center">
          <ThumbsUp className="w-4 h-4 mr-1.5" />
          <span>{article.stats.likes.toLocaleString()} lượt thích</span>
        </div>
        <div className="flex items-center">
          <MessageCircle className="w-4 h-4 mr-1.5" />
          <span>{article.stats.comments.toLocaleString()} bình luận</span>
        </div>
        <div className="flex items-center">
          <Share2 className="w-4 h-4 mr-1.5" />
          <span>{article.stats.shares.toLocaleString()} chia sẻ</span>
        </div>
      </div>
      {article.featuredImage && (
        <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
          <Image
            src={article.featuredImage}
            alt={article.title}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 ease-in-out hover:scale-105"
          />
        </div>
      )}
      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </>
  );
}
