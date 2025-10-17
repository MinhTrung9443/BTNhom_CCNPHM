"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { articleService } from "@/services/articleService";
import { ArticleDetailResponse } from "@/types/article";
import { ArticleDetail } from "@/components/articles/article-detail";
import { CommentSection } from "@/components/articles/comment-section";
import { ArticleInteractionBar } from "@/components/articles/article-interaction-bar";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Breadcrumb } from "@/components/shared/breadcrumb";

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const slug = params.slug as string;

  const [article, setArticle] = useState<ArticleDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewTracked, setViewTracked] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await articleService.getArticleBySlug(
          slug,
          session?.accessToken
        );

        if (response.success && response.data) {
          setArticle(response.data);
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Không thể tải bài viết"
        );
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug, session?.accessToken]);

  const handleViewTracked = async () => {
    if (!viewTracked && article) {
      setViewTracked(true);
      // View tracking is handled automatically by the backend when fetching the article
      // No additional API call needed
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ArticleDetailSkeleton />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Không tìm thấy bài viết"}
          </AlertDescription>
        </Alert>
        <Link href="/bai-viet">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách bài viết
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: "Bài viết", href: "/bai-viet" },
            { label: article.title }
          ]}
        />
      </div>

      {/* Back Button */}
      <div className="mb-6">
        <Link href="/bai-viet">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </Link>
      </div>

      {/* Article Content */}
      <ArticleDetail article={article} onViewTracked={handleViewTracked} />

      {/* Interaction Bar */}
      <ArticleInteractionBar
        articleId={article._id}
        articleTitle={article.title}
        articleUrl={typeof window !== "undefined" ? window.location.href : ""}
        initialLiked={article.userInteraction?.hasLiked}
        initialLikesCount={article.stats.likes}
      />

      {/* Comment Section */}
      <CommentSection articleId={article._id} />
    </div>
  );
}

function ArticleDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-12 w-3/4" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="w-full h-[400px] rounded-lg" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}
