import { useState, useEffect, useCallback } from "react";
import { articleService } from "@/services/articleService";
import { Article, ArticleFilters } from "@/types/article";
import { useSession } from "next-auth/react";

export function useArticles(initialFilters?: ArticleFilters) {
  const { data: session } = useSession();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialFilters?.page || 1);
  const [filters, setFilters] = useState<ArticleFilters>(initialFilters || {});

  const fetchArticles = useCallback(
    async (pageNum: number, append: boolean = false) => {
      try {
        setLoading(true);
        setError(null);
        if (!append) {
          setArticles([]);
        }

        const response = await articleService.getArticles(
          { ...filters, page: pageNum },
          session?.user?.accessToken
        );

        if (response && response.data) {
          const { data: newArticles, meta } = response;
          setArticles((prev) => (append ? [...prev, ...newArticles] : newArticles));
          setHasMore(meta.hasNext);
        }
      } catch (err: unknown) {
        setError((err as any).response?.data?.message || "Không thể tải bài viết");
      } finally {
        setLoading(false);
      }
    },
    [filters, session?.user?.accessToken]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchArticles(nextPage, true);
    }
  }, [loading, hasMore, page, fetchArticles]);

  const refresh = useCallback(() => {
    setPage(1);
    setArticles([]);
    fetchArticles(1, false);
  }, [fetchArticles]);

  const updateFilters = useCallback((newFilters: ArticleFilters) => {
    setFilters(newFilters);
    setPage(1);
    setArticles([]);
  }, []);

  useEffect(() => {
    fetchArticles(1, false);
  }, [filters]);

  return {
    articles,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    updateFilters,
  };
}
