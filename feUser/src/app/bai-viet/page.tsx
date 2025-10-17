"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArticleList } from "@/components/articles/article-list";
import { ArticleFilters } from "@/components/articles/article-filters";
import { useArticles } from "@/hooks/use-articles";
import { ArticleFilters as ArticleFiltersType } from "@/types/article";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Breadcrumb } from "@/components/shared/breadcrumb";

export default function ArticlesPage() {
  const searchParams = useSearchParams();
  const keywordFromUrl = searchParams.get("keyword") || "";
  
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const { articles, loading, error, hasMore, loadMore, updateFilters } =
    useArticles({ limit: 9, keyword: keywordFromUrl });

  // Extract unique tags from articles
  useEffect(() => {
    console.log("Articles updated:", articles);
    if (articles.length > 0) {
      const tags = new Set<string>();
      articles.forEach((article) => {
        article.tags?.forEach((tag) => tags.add(tag));
      });
      setAvailableTags(Array.from(tags));
    }
  }, [articles]);

  const handleFilterChange = (filters: ArticleFiltersType) => {
    updateFilters({ ...filters, limit: 9 });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: "Bài viết" }
          ]}
        />
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Bài viết
        </h1>
        <p className="text-muted-foreground">
          Khám phá những câu chuyện và kiến thức về đặc sản Sóc Trăng
        </p>
      </div>

      {/* Filters */}
      <ArticleFilters
        onFilterChange={handleFilterChange}
        availableTags={availableTags}
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Article List */}
      <ArticleList
        articles={articles}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </div>
  );
}
