import { ApiErrorResponse, ApiResponse } from '@/types/api';
import { Product } from '@/types/product';

const API_URL = 'https://fakestoreapi.com';

/**
 * Custom HTTP Error class - giống cấu trúc axios error
 */
export class HttpError<T = ApiErrorResponse> extends Error {
  public response: {
    status: number;
    data: T;
  };

  constructor(status: number, data: T, message: string) {
    super(message);
    this.name = 'HttpError';
    this.response = {
      status,
      data,
    };
  }
}

const isApiResponse = <T = unknown>(x: any): x is ApiResponse<T> =>
  x && typeof x === 'object' && 'success' in x && 'message' in x;

/**
 * Hàm wrapper cho fetch với error handling giống axios
 * @param endpoint - Endpoint của API (ví dụ: '/cart')
 * @param accessToken - JWT token, có thể là null hoặc undefined
 * @param options - Các tùy chọn của fetch (method, body, cache, next...)
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  accessToken: string | null | undefined,
  options: RequestInit = {}
): Promise<T> {
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Chỉ thêm header Authorization nếu có accessToken
  if (accessToken) {
    defaultHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || API_URL}${endpoint}`,
    config
  );

  // Parse response body trước khi check error
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.toLowerCase().includes('application/json');
  
  let body: any = undefined;
  if (isJson) {
    try {
      body = await response.json();
    } catch {
      body = { success: false, message: 'Invalid JSON response' };
    }
  } else {
    body = { success: false, message: await response.text() };
  }

  // Nếu response không ok, throw error với cấu trúc giống axios
  if (!response.ok) {
    // Nếu body có cấu trúc ApiErrorResponse, dùng luôn
    const errorData: ApiErrorResponse = body?.message 
      ? body 
      : {
          success: false,
          message: body?.message || `Request failed with status ${response.status}`,
        };

    throw new HttpError(
      response.status,
      errorData,
      errorData.message
    );
  }

  // Nếu API trả về ApiResponse với success: false
  if (isApiResponse<T>(body) && !body.success) {
    throw new HttpError(
      response.status,
      body as ApiErrorResponse,
      body.message
    );
  }

  // Return data
  if (isApiResponse<T>(body)) {
    return body as T;
  }

  return body as T;
}

/**
 * CÁCH SỬ DỤNG:
 * 
 * try {
 *   const data = await apiFetch<User>('/api/user', token);
 *   console.log(data); // Chỉ có data, không có success/message wrapper
 * } catch (err) {
 *   if (err instanceof HttpError) {
 *     console.error(err.response.data.message); // ✅ Giống axios!
 *     console.error(err.response.status);        // Status code
 *   }
 * }
 */


/**
 * Helper function để fetch data từ FakeStoreAPI
 * LƯU Ý: Đây là mock data, trong production nên dùng productService với ApiResponse<T>
 */
async function fetchAPI(endpoint: string) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch from API:", error);
    return [];
  }
}

/**
 * Các helper functions dưới đây dùng FakeStoreAPI để mock data.
 * Trong production, nên migrate sang productService với ApiResponse<T>
 */

export async function getFeaturedProducts(): Promise<Product[]> {
  const allProducts = await getAllProducts();
  return allProducts.slice(0, 4);
}

export async function getNewProducts(): Promise<Product[]> {
  const allProducts = await getAllProducts();
  return allProducts.slice(4, 8);
}

export async function getBestsellerProducts(): Promise<Product[]> {
  const allProducts = await getAllProducts();
  return allProducts.slice(8, 12);
}

export async function getFavoriteProducts(): Promise<Product[]> {
  const allProducts = await getAllProducts();
  return allProducts.slice(12, 16);
}

export async function getProductById(id: string): Promise<Product | null> {
  return await fetchAPI(`/products/${id}`);
}

export async function getAllProducts(): Promise<Product[]> {
  return await fetchAPI('/products');
}