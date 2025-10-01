import { apiFetch } from '@/lib/api'; // Dùng hàm apiFetch đã được chuẩn hóa
import { Product, ProductListResponse } from '@/types/product';
import { ApiResponse } from '@/types/api';

class ProductService {
  // Lấy tất cả sản phẩm
  async getAll(accessToken?: string): Promise<ApiResponse<Product[]>> {
    return await apiFetch<ApiResponse<Product[]>>('/products', accessToken);
  }

  // Lấy sản phẩm theo ID
  async getById(id: string, accessToken?: string): Promise<ApiResponse<Product>> {
    return await apiFetch<ApiResponse<Product>>(`/products/${id}`, accessToken);
  }

  // Lấy sản phẩm theo slug
  async getBySlug(slug: string, accessToken?: string): Promise<ApiResponse<Product>> {
    return await apiFetch<ApiResponse<Product>>(`/products/slug/${slug}`, accessToken);
  }
  
  // Các hàm khác như getLatestProducts, getBestsellerProducts...
  async getLatestProducts(accessToken?: string): Promise<ApiResponse<ProductListResponse>> {
    return await apiFetch<ApiResponse<ProductListResponse>>('/products/latest', accessToken);
  }

  async getBestsellerProducts(accessToken?: string): Promise<ApiResponse<ProductListResponse>> {
    return await apiFetch<ApiResponse<ProductListResponse>>('/products/bestsellers', accessToken);
  }
}

export const productService = new ProductService();