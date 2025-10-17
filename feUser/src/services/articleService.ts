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
  ): Promise<ApiResponse<{ meta: ArticleListResponse; data: Article[] }>> {
    const searchParams = new URLSearchParams();
    
    if (filters?.page) searchParams.append("page", filters.page.toString());
    if (filters?.limit) searchParams.append("limit", filters.limit.toString());
    if (filters?.keyword) searchParams.append("keyword", filters.keyword);
    if (filters?.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => searchParams.append("tags", tag));
    }
    if (filters?.sortBy) searchParams.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) searchParams.append("sortOrder", filters.sortOrder);

    const endpoint = `/articles/public${searchParams.toString() ? "?" + searchParams.toString() : ""}`;
    return await apiFetch<ApiResponse<{ meta: ArticleListResponse; data: Article[] }>>
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
  async toggleLike(
    articleId: string,
    accessToken: string
  ): Promise<ApiResponse<{ hasLiked: boolean; likesCount: number }>> {
    return await apiFetch<ApiResponse<{ hasLiked: boolean; likesCount: number }>>(
      `/articles/public/${articleId}/like`,
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
  ): Promise<ApiResponse<{ sharesCount: number }>> {
    return await apiFetch<ApiResponse<{ sharesCount: number }>>(
      `/articles/public/${articleId}/share`,
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
  ): Promise<ApiResponse<{ meta: CommentListResponse; data: Comment[] }>> {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    return await apiFetch<ApiResponse<{ meta: CommentListResponse; data: Comment[] }>>(
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
      `/articles/public/comments/${commentId}`,
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
  ): Promise<ApiResponse<null>> {
    return await apiFetch<ApiResponse<null>>(
      `/articles/public/comments/${commentId}`,
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
  ): Promise<ApiResponse<{ hasLiked: boolean; likesCount: number }>> {
    return await apiFetch<ApiResponse<{ hasLiked: boolean; likesCount: number }>>(
      `/articles/public/comments/${commentId}/like`,
      accessToken,
      { method: "POST" }
    );
  }

  /**
   * Trả lời comment
   */
  async replyToComment(
    commentId: string,
    content: string,
    accessToken: string
  ): Promise<ApiResponse<Comment>> {
    return await apiFetch<ApiResponse<Comment>>(
      `/articles/public/comments/${commentId}/reply`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({ content }),
      }
    );
  }
}

export const articleService = new ArticleService();
