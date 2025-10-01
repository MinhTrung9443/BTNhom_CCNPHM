import { apiFetch } from '@/lib/api';
import { Category } from '@/types/product';
import { ApiResponse } from '@/types/api';

class CategoryService {
  // Lấy tất cả danh mục
  async getAll(accessToken?: string): Promise<ApiResponse<Category[]>> {
    return await apiFetch<ApiResponse<Category[]>>('/categories', accessToken, {
      method: 'GET',
      next: { revalidate: 3600 } // Cache 1 giờ
    });
  }

  // Lấy danh mục theo ID
  async getById(id: string, accessToken?: string): Promise<ApiResponse<Category>> {
    return await apiFetch<ApiResponse<Category>>(`/categories/${id}`, accessToken);
  }
}

export const categoryService = new CategoryService();