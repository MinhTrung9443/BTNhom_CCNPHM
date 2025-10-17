"use client";

import { ArticleLikeButton } from "./article-like-button";
import { ArticleShareButtons } from "./article-share-buttons";
import { Separator } from "@/components/ui/separator";

interface ArticleInteractionBarProps {
  articleId: string;
  articleTitle: string;
  articleUrl: string;
  initialLiked?: boolean;
  initialLikesCount?: number;
}

export function ArticleInteractionBar({
  articleId,
  articleTitle,
  articleUrl,
  initialLiked = false,
  initialLikesCount = 0,
}: ArticleInteractionBarProps) {
  return (
    <div className="sticky top-20 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-y py-4 my-8">
      <div className="flex items-center justify-center gap-4">
        <ArticleLikeButton
          articleId={articleId}
          initialLiked={initialLiked}
          initialCount={initialLikesCount}
          variant="outline"
          size="default"
          showCount={true}
        />
        <Separator orientation="vertical" className="h-8" />
        <ArticleShareButtons
          articleId={articleId}
          articleTitle={articleTitle}
          articleUrl={articleUrl}
          variant="outline"
          size="default"
        />
      </div>
    </div>
  );
}
