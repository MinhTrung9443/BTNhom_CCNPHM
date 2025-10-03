'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductSearch } from '@/components/product-search';
import { SearchResults } from '@/components/search-results';
import { SearchFilters, SearchResponse } from '@/types/product';

interface SearchPageClientProps {
  initialData: SearchResponse;
  initialFilters: SearchFilters;
}

export function SearchPageClient({ initialData, initialFilters }: SearchPageClientProps) {
  // 1. Sử dụng initialData từ server cho lần render đầu tiên
  const [results, setResults] = useState<SearchResponse>(initialData);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // 2. Effect để fetch dữ liệu từ client khi URL thay đổi
  useEffect(() => {
    // Kiểm tra xem URL hiện tại có khác với initialFilters không
    const currentKeyword = searchParams.get('keyword') || '';
    const currentPage = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const currentCategoryId = searchParams.get('categoryId') || '';
    
    // Nếu URL vẫn là mặc định, không cần fetch lại
    const isDefaultState = 
      !currentKeyword && 
      currentPage === 1 && 
      !currentCategoryId &&
      !searchParams.get('minPrice') &&
      !searchParams.get('maxPrice') &&
      !searchParams.get('minRating') &&
      !searchParams.get('inStock');

    if (isDefaultState) {
      return;
    }

    // Fetch dữ liệu mới từ client khi URL thay đổi
    const fetchClientSideResults = async () => {
      setIsLoading(true);
      
      try {
        // Gọi API Route Handler
        const response = await fetch(`/api/search?${searchParams.toString()}`);
        const data: SearchResponse = await response.json();
        
        setResults(data);
        
        // Cập nhật filters state để sync với URL
        const newFilters: SearchFilters = {
          keyword: currentKeyword,
          categoryId: currentCategoryId,
          minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
          maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
          minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
          inStock: searchParams.get('inStock') ? searchParams.get('inStock') === 'true' : undefined,
          sortBy: (searchParams.get('sortBy') || 'createdAt') as SearchFilters['sortBy'],
          sortOrder: (searchParams.get('sortOrder') || 'desc') as SearchFilters['sortOrder'],
          page: currentPage,
          limit: 12,
        };
        setFilters(newFilters);
      } catch (error) {
        console.error('Client-side search failed:', error);
        // Giữ nguyên results hiện tại nếu có lỗi
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientSideResults();
  }, [searchParams]);

  // 3. Hàm xử lý khi người dùng nhấn tìm kiếm (cập nhật URL)
  const handleSearch = (newFilters: SearchFilters) => {
    const params = new URLSearchParams();
    
    // Chỉ thêm các params có giá trị
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.set(key, value.toString());
      }
    });
    
    // Cập nhật URL, useEffect ở trên sẽ tự động fetch dữ liệu
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Tìm kiếm sản phẩm
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Khám phá các đặc sản Sóc Trăng chất lượng cao với công cụ tìm kiếm thông minh
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Search Bar */}
        <div className="lg:hidden mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <ProductSearch 
              onSearch={handleSearch}
              initialFilters={filters}
            />
          </div>
        </div>

        {/* Desktop Layout with Sidebar */}
        <div className="flex gap-8">
          {/* Sidebar - Filters */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <ProductSearch 
                onSearch={handleSearch}
                initialFilters={filters}
              />
            </div>
          </div>

          {/* Main Content - Results */}
          <div className="flex-1 min-w-0">
            <SearchResults 
              data={isLoading ? null : results}
              isLoading={isLoading}
              onPageChange={(page) => handleSearch({ ...filters, page })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
