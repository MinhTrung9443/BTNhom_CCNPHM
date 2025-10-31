import { apiFetch } from "@/lib/api";
import { ApiResponse } from "@/types/api";
import {
  Article,
  ArticleDetailResponse,
  ArticleFilters,
  ArticleListResponse,
  Comment,
  CommentListResponse,
} from "@/types/article";

class ArticleService {
  /**
   * Lấy danh sách bài viết đã publish với pagination và filters
   */
  async getArticles(
    filters?: ArticleFilters,
    accessToken?: string
  ): Promise<{ meta: ArticleListResponse; data: Article[] }> {
    const searchParams = new URLSearchParams();
    
    if (filters?.page) searchParams.append("page", filters.page.toString());
    if (filters?.limit) searchParams.append("limit", filters.limit.toString());
    if (filters?.keyword) searchParams.append("search", filters.keyword);
    if (filters?.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => searchParams.append("tags", tag));
    }
    if (filters?.sortBy) searchParams.append("sortBy", filters.sortBy);

    const endpoint = `/articles/public${searchParams.toString() ? "?" + searchParams.toString() : ""}`;
    return await apiFetch<{ meta: ArticleListResponse; data: Article[] }>
(endpoint, accessToken);
  }

  /**
   * Lấy chi tiết bài viết theo slug
   */
  async getArticleBySlug(
    slug: string,
    accessToken?: string
  ): Promise<ApiResponse<ArticleDetailResponse>> {
    return await apiFetch<ApiResponse<ArticleDetailResponse>>(
      `/articles/public/slug/${slug}`,
      accessToken
    );
  }

  /**
   * Like/Unlike bài viết
   */
  async toggleArticleLike(
    articleId: string,
    accessToken: string
  ): Promise<ApiResponse<{ liked: boolean; likes: number }>> {
    return await apiFetch<ApiResponse<{ liked: boolean; likes: number }>>(
      `/article-interactions/${articleId}/like`,
      accessToken,
      { method: "POST" }
    );
  }

  /**
   * Ghi nhận chia sẻ bài viết
   */
  async trackShare(
    articleId: string,
    platform: 'facebook' | 'zalo' | 'twitter' | 'copy',
    accessToken?: string
  ): Promise<ApiResponse<{ shares: number; platform: string }>> {
    return await apiFetch<ApiResponse<{ shares: number; platform: string }>>(
      `/article-interactions/${articleId}/share`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({ platform }),
      }
    );
  }

  /**
   * Lấy danh sách comment của bài viết
   */
  async getComments(
    articleId: string,
    page: number = 1,
    limit: number = 10,
    accessToken?: string
  ): Promise<{ meta: CommentListResponse; data: Comment[] }> {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    return await apiFetch<{ meta: CommentListResponse; data: Comment[] }>(
      `/articles/public/${articleId}/comments?${searchParams.toString()}`,
      accessToken
    );
  }

  /**
   * Tạo comment mới
   */
  async createComment(
    articleId: string,
    content: string,
    parentCommentId: string | null,
    accessToken: string
  ): Promise<ApiResponse<Comment>> {
    return await apiFetch<ApiResponse<Comment>>(
      `/articles/public/${articleId}/comments`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({ content, parentCommentId }),
      }
    );
  }

  /**
   * Cập nhật comment
   */
  async updateComment(
    commentId: string,
    content: string,
    accessToken: string
  ): Promise<ApiResponse<Comment>> {
    return await apiFetch<ApiResponse<Comment>>(
      `/comments/${commentId}`,
      accessToken,
      {
        method: "PUT",
        body: JSON.stringify({ content }),
      }
    );
  }

  /**
   * Xóa comment
   */
  async deleteComment(
    commentId: string,
    accessToken: string
  ): Promise<ApiResponse<{ message: string }>> {
    return await apiFetch<ApiResponse<{ message: string }>>(
      `/comments/${commentId}`,
      accessToken,
      { method: "DELETE" }
    );
  }

  /**
   * Like/Unlike comment
   */
  async toggleCommentLike(
    commentId: string,
    accessToken: string
  ): Promise<ApiResponse<{ liked: boolean; likes: number }>> {
    return await apiFetch<ApiResponse<{ liked: boolean; likes: number }>>(
      `/comments/${commentId}/like`,
      accessToken,
      { method: "POST" }
    );
  }

  /**
   * Submit comment to n8n for AI moderation
   */
  async submitCommentModeration(
    commentId: string,
    accessToken: string
  ): Promise<ApiResponse<{ message: string }>> {
    return await apiFetch<ApiResponse<{ message: string }>>(
      `/comments/${commentId}/submit-moderation`,
      accessToken,
      { method: "POST" }
    );
  }

}

export const articleService = new ArticleService();
