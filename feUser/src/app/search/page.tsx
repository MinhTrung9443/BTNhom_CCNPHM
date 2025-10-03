import { Suspense } from 'react';
import { SearchFilters, SearchResponse } from '@/types/product';
import { SearchPageClient } from '@/app/search/search-page-client';
import { productService } from '@/services/productService';

/**
 * Kích hoạt ISR - Cache trang mặc định trong 1 giờ (3600 giây)
 * Next.js sẽ tạo ra phiên bản tĩnh cho URL không có search params
 * giúp tải cực nhanh cho lần truy cập đầu tiên
 */
export const revalidate = 3600;

function SearchPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Tìm kiếm sản phẩm
            </h1>
            <p className="text-xl text-green-100">
              Đang tải...
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Server Component - Chỉ fetch dữ liệu mặc định (trang 1, không có filter)
 * KHÔNG đọc searchParams để Next.js có thể render tĩnh và cache trang này
 */
export default async function SearchPage() {
  // 1. Fetch dữ liệu mặc định cho lần tải đầu tiên (trang 1, không có filter)
  const initialFilters: SearchFilters = { 
    page: 1, 
    limit: 12,
    sortBy: 'createdAt',
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
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPageClient 
        initialData={initialData} 
        initialFilters={initialFilters}
      />
    </Suspense>
  );
}