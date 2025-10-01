'use client';

import { useState } from 'react';
import { ProductSearch } from '@/components/product-search';
import { SearchResults } from '@/components/search-results';
import { SearchFilters, SearchResponse } from '@/types/product';

interface SearchPageClientProps {
  initialData: SearchResponse;
  initialFilters: SearchFilters;
}

export function SearchPageClient({ initialData, initialFilters }: SearchPageClientProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
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
              filters={filters}
              onFiltersChange={setFilters}
              initialData={initialData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
