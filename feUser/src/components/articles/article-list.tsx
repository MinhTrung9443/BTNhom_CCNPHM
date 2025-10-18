"use client";

import { ArticleCard } from "./article-card";
import { Article } from "@/types/article";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ArticleListProps {
  articles: Article[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function ArticleList({
  articles = [],
  loading,
  hasMore,
  onLoadMore,
}: ArticleListProps) {
  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore,
    hasMore,
    loading,
  });

  if (loading && articles.length === 0) {
    return (
      <div className="flex flex-col items-center space-y-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="w-full max-w-2xl">
            <ArticleCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (!loading && articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          Không tìm thấy bài viết nào
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col items-center space-y-8">
        {articles.map((article) => (
          <div key={article._id} className="w-full max-w-2xl">
            <ArticleCard article={article} />
          </div>
        ))}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={loadMoreRef} className="py-8 flex justify-center">
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Đang tải thêm bài viết...</span>
          </div>
        )}
        {!loading && !hasMore && articles.length > 0 && (
          <p className="text-muted-foreground">Đã hiển thị tất cả bài viết</p>
        )}
      </div>
    </div>
  );
}

function ArticleCardSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Skeleton className="w-full h-48" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
      <div className="p-4 pt-0 border-t">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}
