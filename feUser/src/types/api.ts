/**
 * API Response Types
 * Chuẩn hóa format response từ API
 */

/**
 * Generic API Response wrapper
 * @template T - Kiểu dữ liệu của data trả về
 */
export interface ApiResponse<T = unknown> {
  /**
   * Trạng thái thành công/thất bại của request
   */
  success: boolean;

  /**
   * Thông báo từ server (có thể là success message hoặc error message)
   */
  message: string;

  /**
   * Dữ liệu trả về (kiểu generic T)
   */
  data: T;

  /**
   * Metadata bổ sung (pagination, etc.) - optional
   */
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Error Response - khi API trả về lỗi
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
}

/**
 * Paginated Response - cho các API có phân trang
 */
export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
