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
  createdAt: string;
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

  async getProductReviews(productId: string): Promise<ReviewResponse> {
    try {
      const result = await apiFetch(`${this.baseUrl}/product/${productId}`, null, {
        method: "GET",
      });

      return {
        success: true,
        message: "Lấy đánh giá thành công",
        data: result,
      };
    } catch (error: any) {
      console.error("Get reviews error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Không thể kết nối đến máy chủ",
      };
    }
  }

  async getUserReviews(accessToken: string): Promise<ReviewResponse> {
    try {
      const result = await apiFetch(`${this.baseUrl}/user`, accessToken, {
        method: "GET",
      });

      return {
        success: true,
        message: "Lấy đánh giá của user thành công",
        data: result,
      };
    } catch (error: any) {
      console.error("Get user reviews error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Không thể kết nối đến máy chủ",
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
