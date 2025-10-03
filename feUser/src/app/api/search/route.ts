import { NextResponse, NextRequest } from 'next/server';
import { productService } from '@/services/productService';
import { SearchFilters } from '@/types/product';

/**
 * API Route Handler cho tìm kiếm sản phẩm từ client-side
 * Endpoint: /api/search?keyword=...&page=1&...
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse các filter từ query params
    const filters: SearchFilters = {
      keyword: searchParams.get('keyword') || '',
      categoryId: searchParams.get('categoryId') || '',
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
      inStock: searchParams.get('inStock') ? searchParams.get('inStock') === 'true' : undefined,
      sortBy: (searchParams.get('sortBy') || 'createdAt') as SearchFilters['sortBy'],
      sortOrder: (searchParams.get('sortOrder') || 'desc') as SearchFilters['sortOrder'],
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 12,
    };

    // Gọi service để fetch dữ liệu (không cần token cho search public)
    const results = await productService.searchProducts(filters);
    
    // Trả về response với đúng format
    return NextResponse.json(results);
  } catch (error) {
    console.error('API search error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi server khi tìm kiếm sản phẩm',
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
      }, 
      { status: 500 }
    );
  }
}
