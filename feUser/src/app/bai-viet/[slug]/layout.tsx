import { Metadata } from "next";
import { articleService } from "@/services/articleService";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const response = await articleService.getArticleBySlug(slug);

    if (response.success && response.data) {
      const article = response.data;

      return {
        title: article.seoMeta?.title || article.title,
        description: article.seoMeta?.description || article.excerpt,
        keywords: article.seoMeta?.keywords || article.tags,
        openGraph: {
          title: article.seoMeta?.title || article.title,
          description: article.seoMeta?.description || article.excerpt,
          images: [
            {
              url: article.featuredImage.url,
              alt: article.featuredImage.alt || article.title,
            },
          ],
          type: "article",
          publishedTime: article.publishedAt,
          authors: ["Đặc sản Sóc Trăng"],
          tags: article.tags,
        },
        twitter: {
          card: "summary_large_image",
          title: article.seoMeta?.title || article.title,
          description: article.seoMeta?.description || article.excerpt,
          images: [article.featuredImage.url],
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return {
    title: "Bài viết - Đặc sản Sóc Trăng",
    description: "Khám phá những câu chuyện và kiến thức về đặc sản Sóc Trăng",
  };
}

export default function ArticleDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
