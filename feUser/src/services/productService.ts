import { apiFetch } from "@/lib/api"; // Dùng hàm apiFetch đã được chuẩn hóa
import { Product, ProductListResponse, SearchFilters, SearchProduct, SearchMeta, SearchResponse } from "@/types/product";
import { ApiResponse } from "@/types/api";

class ProductService {
  // Lấy tất cả sản phẩm
  async getAll(accessToken?: string): Promise<ApiResponse<Product[]>> {
    return await apiFetch<ApiResponse<Product[]>>("/products", accessToken);
  }

  // Lấy tất cả sản phẩm với pagination
  async getAllProducts(
    params?: { page?: number; limit?: number; [key: string]: any },
    accessToken?: string
  ): Promise<ApiResponse<ProductListResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const endpoint = `/products${searchParams.toString() ? "?" + searchParams.toString() : ""}`;
    return await apiFetch<ApiResponse<ProductListResponse>>(endpoint, accessToken);
  }

  // Lấy sản phẩm theo ID
  async getById(id: string, accessToken?: string): Promise<ApiResponse<Product>> {
    return await apiFetch<ApiResponse<Product>>(`/products/${id}`, accessToken);
  }

  // Lấy chi tiết sản phẩm
  async getProductDetail(id: string, accessToken?: string): Promise<ApiResponse<Product>> {
    return await apiFetch<ApiResponse<Product>>(`/products/${id}`, accessToken);
  }

  // Lấy sản phẩm theo slug
  async getBySlug(slug: string, accessToken?: string): Promise<ApiResponse<Product>> {
    return await apiFetch<ApiResponse<Product>>(`/products/slug/${slug}`, accessToken);
  }

  // Các hàm khác như getLatestProducts, getBestsellerProducts...
  async getLatestProducts(params?: { page?: number; limit?: number }, accessToken?: string): Promise<ApiResponse<ProductListResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    
    const endpoint = `/products/latest${searchParams.toString() ? "?" + searchParams.toString() : ""}`;
    return await apiFetch<ApiResponse<ProductListResponse>>(endpoint, accessToken);
  }

  async getBestsellerProducts(params?: { page?: number; limit?: number }, accessToken?: string): Promise<ApiResponse<ProductListResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    
    const endpoint = `/products/bestsellers${searchParams.toString() ? "?" + searchParams.toString() : ""}`;
    return await apiFetch<ApiResponse<ProductListResponse>>(endpoint, accessToken);
  }

  async getMostViewedProducts(params?: { page?: number; limit?: number }, accessToken?: string): Promise<ApiResponse<ProductListResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    
    const endpoint = `/products/most-viewed${searchParams.toString() ? "?" + searchParams.toString() : ""}`;
    return await apiFetch<ApiResponse<ProductListResponse>>(endpoint, accessToken);
  }

  async getTopDiscountProducts(params?: { page?: number; limit?: number }, accessToken?: string): Promise<ApiResponse<ProductListResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    
    const endpoint = `/products/top-discounts${searchParams.toString() ? "?" + searchParams.toString() : ""}`;
    return await apiFetch<ApiResponse<ProductListResponse>>(endpoint, accessToken);
  }

  // Lấy sản phẩm tương tự
  async getSimilarProducts(productId: string, accessToken?: string): Promise<ApiResponse<Product[]>> {
    return await apiFetch<ApiResponse<Product[]>>(`/products/${productId}/similar`, accessToken);
  }

  // Tìm kiếm sản phẩm
  async searchProducts(filters: SearchFilters, accessToken?: string): Promise<SearchResponse> {
    const searchParams = new URLSearchParams();

    // Thêm các filter vào query params
    if (filters.keyword) searchParams.append("keyword", filters.keyword);
    if (filters.categoryId) searchParams.append("categoryId", filters.categoryId);
    if (filters.minPrice !== undefined) searchParams.append("minPrice", filters.minPrice.toString());
    if (filters.maxPrice !== undefined) searchParams.append("maxPrice", filters.maxPrice.toString());
    if (filters.minRating !== undefined) searchParams.append("minRating", filters.minRating.toString());
    if (filters.inStock !== undefined) searchParams.append("inStock", filters.inStock.toString());
    if (filters.page) searchParams.append("page", filters.page.toString());
    if (filters.limit) searchParams.append("limit", filters.limit.toString());
    if (filters.sortBy) searchParams.append("sortBy", filters.sortBy);
    if (filters.sortOrder) searchParams.append("sortOrder", filters.sortOrder);

    const endpoint = `/products/search?${searchParams.toString()}`;

    return await apiFetch<SearchResponse>(endpoint, accessToken, {
      method: "GET",
      next: { revalidate: 300 }, // Cache 5 phút cho search results
    });
  }
}

export const productService = new ProductService();
