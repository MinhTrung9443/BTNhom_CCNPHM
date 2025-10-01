import { ApiResponse } from '@/types/api';

/**
 * @description Định nghĩa cấu trúc cho một sản phẩm trong danh sách yêu thích.
 * API response trả về _id thay vì id.
 */
export interface FavoriteProduct {
  _id: string;
  name: string;
  price: number;
  discount: number;
  images: string[];
  slug?: string; // Optional slug, nếu backend không trả về thì ProductCard sẽ fallback về _id
  description?: string; // Optional description cho ProductCard
}

/**
 * @description Cấu trúc cho response từ API lấy danh sách sản phẩm yêu thích.
 * Endpoint này có cấu trúc response đặc biệt, không tuân theo ApiResponse<T> tiêu chuẩn.
 */
export interface FavoritesResponse {
  favorites: FavoriteProduct[];
}

/**
 * @description Cấu trúc cho response từ API thêm/xóa sản phẩm yêu thích.
 * Endpoint này cũng có cấu trúc response riêng.
 */
export interface ToggleFavoriteResponse {
  message: string;
  favorited: boolean;
}

/**
 * @description Kiểu dữ liệu chuẩn hóa khi sử dụng trong service, tuân thủ ApiResponse<T>.
 * Dữ liệu trả về chỉ là một boolean cho biết trạng thái yêu thích.
 */
export type ToggleFavoriteApiResponse = ApiResponse<{ favorited: boolean }>;