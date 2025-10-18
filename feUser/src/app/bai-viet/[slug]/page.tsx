import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { articleService } from '@/services/articleService';
import { ArticleDetail } from '@/components/articles/article-detail';
import { ArticleInteractionBar } from '@/components/articles/article-interaction-bar';
import { CommentSection } from '@/components/articles/comment-section';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/auth';

type ArticlePageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  try {
    const session = await auth();
    const response = await articleService.getArticleBySlug(params.slug, session?.user?.accessToken);
    const article = response.data;
    console.log('Article for metadata:', article);
    if (!article || !article.seo) {
      return {
        title: 'Không tìm thấy bài viết',
      };
    }

    const { seo } = article;
    return {
      title: seo.metaTags.title,
      description: seo.metaTags.description,
      keywords: seo.metaTags.keywords,
      openGraph: {
        title: seo.openGraph.title,
        description: seo.openGraph.description,
        url: seo.openGraph.url,
        images: [
          {
            url: seo.openGraph.image,
            width: 1200,
            height: 630,
            alt: seo.openGraph.title,
          },
        ],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: seo.twitter.title,
        description: seo.twitter.description,
        images: [seo.twitter.image],
      },
      alternates: {
        canonical: seo.canonical,
      },
    };
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    return {
      title: 'Lỗi',
      description: 'Không thể tải siêu dữ liệu cho bài viết này.',
    };
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = params;
  const session = await auth();
  const response = await articleService.getArticleBySlug(slug, session?.user?.accessToken).catch(() => null);

  if (!response || !response.data) {
    notFound();
  }
  const article = response.data;

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
      <article>
        <ArticleDetail article={article} />
        <Suspense fallback={<Skeleton className="h-12 w-full mt-4" />}>
          <ArticleInteractionBar article={article} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-64 w-full mt-8" />}>
          <CommentSection articleId={article._id} />
        </Suspense>
      </article>
    </div>
  );
}
