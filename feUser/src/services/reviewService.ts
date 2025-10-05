import { apiFetch } from "@/lib/api";

export interface CreateReviewData {
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewData {
  reviewId: string;
  rating: number;
  comment: string;
}

export interface ExistingReview {
  _id: string;
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
  editCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Review {
  _id: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  editCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserReview {
  _id: string;
  userId: string;
  productId: {
    _id: string;
    name: string;
    images: string[];
    slug?: string;
  };
  orderId: {
    _id: string;
    orderNumber?: string;
  };
  rating: number;
  comment: string;
  isApproved: boolean;
  editCount: number;
  voucherGenerated: boolean;
  voucherCode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserReviewsResponse {
  success: boolean;
  message: string;
  data: {
    reviews: UserReview[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalReviews: number;
      hasNext: boolean;
      hasPrev: boolean;
      limit: number;
    };
  };
}

export interface ReviewsResponse {
  success: boolean;
  message: string;
  data: {
    reviews: Review[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalReviews: number;
      hasNext: boolean;
      hasPrev: boolean;
      limit: number;
    };
    summary: {
      averageRating: number;
      totalReviews: number;
      ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
      };
    };
  };
}

export interface ReviewResponse {
  success: boolean;
  message: string;
  data?: any;
}

class ReviewService {
  private baseUrl = "/reviews";

  async createReview(data: CreateReviewData, accessToken: string): Promise<ReviewResponse> {
    try {
      const result = await apiFetch(`${this.baseUrl}`, accessToken, {
        method: "POST",
        body: JSON.stringify(data),
      });

      return {
        success: true,
        message: "Đánh giá đã được gửi thành công",
        data: result,
      };
    } catch (error: any) {
      console.error("Review service error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Không thể kết nối đến máy chủ",
      };
    }
  }

  async getProductReviews(productId: string, page: number = 1, limit: number = 10, accessToken?: string): Promise<ReviewsResponse> {
    try {
      console.log("Making API call to:", `/reviews/product/${productId}?page=${page}&limit=${limit}`);
      const result = (await apiFetch(`${this.baseUrl}/product/${productId}?page=${page}&limit=${limit}`, accessToken)) as any;

      console.log("API result:", result);

      return {
        success: true,
        message: "Lấy đánh giá thành công",
        data: result.data || result, // Fallback nếu result không có .data
      };
    } catch (error: any) {
      console.error("Get product reviews error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Không thể tải đánh giá",
        data: {
          reviews: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalReviews: 0,
            hasNext: false,
            hasPrev: false,
            limit: 10,
          },
          summary: {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          },
        },
      };
    }
  }

  async getUserReviews(page: number = 1, limit: number = 10, accessToken: string): Promise<UserReviewsResponse> {
    try {
      const result = (await apiFetch(`${this.baseUrl}/me?page=${page}&limit=${limit}`, accessToken, {
        method: "GET",
      })) as { success: boolean; message: string; data: any };

      return {
        success: true,
        message: "Lấy danh sách đánh giá thành công",
        data: result.data,
      };
    } catch (error: any) {
      console.error("Get user reviews error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Không thể lấy danh sách đánh giá",
        data: {
          reviews: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalReviews: 0,
            hasNext: false,
            hasPrev: false,
            limit: 10,
          },
        },
      };
    }
  }

  async getExistingReview(productId: string, orderId: string, accessToken: string): Promise<ReviewResponse> {
    try {
      const result = await apiFetch(`${this.baseUrl}/check?productId=${productId}&orderId=${orderId}`, accessToken, {
        method: "GET",
      });

      return {
        success: true,
        message: "Kiểm tra đánh giá thành công",
        data: result,
      };
    } catch (error: any) {
      console.error("Check existing review error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Không thể kiểm tra đánh giá hiện tại",
      };
    }
  }

  async updateReview(data: UpdateReviewData, accessToken: string): Promise<ReviewResponse> {
    try {
      const result = await apiFetch(`${this.baseUrl}/${data.reviewId}`, accessToken, {
        method: "PUT",
        body: JSON.stringify({
          rating: data.rating,
          comment: data.comment,
        }),
      });

      return {
        success: true,
        message: "Đánh giá đã được cập nhật thành công",
        data: result,
      };
    } catch (error: any) {
      console.error("Update review error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Không thể cập nhật đánh giá",
      };
    }
  }
}

export const reviewService = new ReviewService();
