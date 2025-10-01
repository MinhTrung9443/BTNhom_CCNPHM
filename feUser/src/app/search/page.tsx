import { Suspense } from 'react';
import { SearchFilters, SearchResponse } from '@/types/product';
import { SearchPageClient } from '@/app/search/search-page-client';
import { apiFetch } from '@/lib/api';

interface SearchPageProps {
  searchParams: Promise<{
    keyword?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    inStock?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
  }>;
}

async function getInitialSearchResults(searchParams: Awaited<SearchPageProps['searchParams']>) {
  const filters: SearchFilters = {
    keyword: searchParams.keyword || '',
    categoryId: searchParams.categoryId || '',
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    minRating: searchParams.minRating ? Number(searchParams.minRating) : undefined,
    inStock: searchParams.inStock ? searchParams.inStock === 'true' : undefined,
    sortBy: (searchParams.sortBy || 'createdAt') as SearchFilters['sortBy'],
    sortOrder: (searchParams.sortOrder || 'desc') as SearchFilters['sortOrder'],
    page: searchParams.page ? Number(searchParams.page) : 1,
    limit: 12
  };

  try {
    // Tạo query string từ filters
    const queryString = new URLSearchParams(
      Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    // Sử dụng apiFetch với cache
    const data = await apiFetch<SearchResponse>(
      `/products/search?${queryString}`,
      null, // Không cần token cho search public
      {
        next: { revalidate: 60 }, // Cache 60 giây
      }
    );

    console.log('SSR fetch with cache:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch search results:', error);
    return {
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
    } as SearchResponse;
  }
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  const initialData = await getInitialSearchResults(searchParams);

  const initialFilters: SearchFilters = {
    keyword: searchParams.keyword || '',
    categoryId: searchParams.categoryId || '',
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    minRating: searchParams.minRating ? Number(searchParams.minRating) : undefined,
    inStock: searchParams.inStock ? searchParams.inStock === 'true' : undefined,
    sortBy: (searchParams.sortBy || 'createdAt') as SearchFilters['sortBy'],
    sortOrder: (searchParams.sortOrder || 'desc') as SearchFilters['sortOrder'],
    page: searchParams.page ? Number(searchParams.page) : 1,
    limit: 12
  };

  return (
    <Suspense fallback={
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
      </div>
    }>
      <SearchPageClient 
        initialData={initialData} 
        initialFilters={initialFilters}
      />
    </Suspense>
  );
}