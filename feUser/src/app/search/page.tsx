import { SearchFilters, SearchResponse } from '@/types/product';
import { SearchPageClient } from '@/app/search/search-page-client';
import { productService } from '@/services/productService';

/**
 * Kích hoạt ISR - Cache trang mặc định trong 1 giờ (3600 giây)
 * Next.js sẽ tạo ra phiên bản tĩnh cho URL không có search params
 * giúp tải cực nhanh cho lần truy cập đầu tiên
 */
export const revalidate = 3600;

/**
 * Server Component - Chỉ fetch dữ liệu mặc định (trang 1, không có filter)
 * KHÔNG đọc searchParams để Next.js có thể render tĩnh và cache trang này
 */
export default async function SearchPage() {
  // 1. Fetch dữ liệu mặc định cho lần tải đầu tiên (trang 1, không có filter)
  const initialFilters: SearchFilters = { 
    page: 1, 
    limit: 12,
    sortBy: 'relevance',
    sortOrder: 'desc'
  };
  
  let initialData: SearchResponse;
  
  try {
    initialData = await productService.searchProducts(initialFilters);
    console.log('SSR: Fetched default search data with ISR cache');
  } catch (error) {
    console.error('SSR: Failed to fetch initial search data:', error);
    // Fallback data nếu fetch thất bại
    initialData = {
      success: false,
      message: 'Lỗi kết nối đến server',
      data: [],
      meta: {
        currentPage: 1,
        totalPages: 0,
        totalProducts: 0,
        hasNext: false,
        hasPrev: false,
        limit: 12,
        filters: {
          keyword: null,
          categoryId: null,
          priceRange: { min: null, max: null },
          minRating: null,
          inStock: null
        },
        sort: { sortBy: 'createdAt', sortOrder: 'desc' }
      }
    };
  }

  // 2. Truyền dữ liệu và filter ban đầu xuống cho Client Component
  return (
    <SearchPageClient
      initialData={initialData}
      initialFilters={initialFilters}
    />
  );
}