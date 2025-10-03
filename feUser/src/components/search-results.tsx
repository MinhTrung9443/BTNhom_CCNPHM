'use client';

import { useState } from 'react';
import { Loader2, AlertCircle, ShoppingCart, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { SearchProduct, SearchResponse } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cartService } from '@/services/cartService';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface SearchResultsProps {
  data: SearchResponse | null;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export function SearchResults({ data, isLoading, onPageChange }: SearchResultsProps) {
  const products = data?.data || [];
  const meta = data?.meta || null;
  const error = data?.success === false ? data.message : null;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Đang tìm kiếm...</h3>
          <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <div className="text-gray-400 mb-6">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Không tìm thấy sản phẩm nào
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc để tìm thấy sản phẩm phù hợp với nhu cầu của bạn.
          </p>
          <div className="flex flex-wrap gap-2 justify-center text-sm">
            <span className="text-gray-400">Gợi ý:</span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">Bánh pía</span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">Bánh cam</span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">Kem bơ</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Results Summary */}
      {meta && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Hiển thị <span className="font-semibold text-gray-900">{((meta.currentPage - 1) * meta.limit) + 1} - {Math.min(meta.currentPage * meta.limit, meta.totalProducts)}</span> trong tổng số <span className="font-semibold text-green-600">{meta.totalProducts}</span> sản phẩm
              {meta.filters.keyword && (
                <span className="font-medium text-gray-900"> cho &ldquo;{meta.filters.keyword}&rdquo;</span>
              )}
            </p>
            <div className="text-xs text-gray-500">
              Trang {meta.currentPage}/{meta.totalPages}
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {products.map((product) => (
            <SearchProductCard
              key={product._id}
              product={product}
            />
          ))}
        </div>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => onPageChange(meta.currentPage - 1)}
              disabled={!meta.hasPrev}
              className="border-gray-300"
            >
              ← Trang trước
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                const page = i + 1;
                const isCurrentPage = page === meta.currentPage;
                
                return (
                  <Button
                    key={page}
                    variant={isCurrentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className={`w-10 ${isCurrentPage ? 'bg-green-600 hover:bg-green-700' : 'border-gray-300'}`}
                  >
                    {page}
                  </Button>
                );
              })}
              
              {meta.totalPages > 5 && (
                <>
                  <span className="px-2 text-gray-400">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(meta.totalPages)}
                    className="w-10 border-gray-300"
                  >
                    {meta.totalPages}
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => onPageChange(meta.currentPage + 1)}
              disabled={!meta.hasNext}
              className="border-gray-300"
            >
              Trang sau →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Component SearchProductCard riêng cho search results
interface SearchProductCardProps {
  product: SearchProduct;
}

function SearchProductCard({ product }: SearchProductCardProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      toast.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await cartService.addItem(session.user.accessToken, {
        productId: product._id,
        quantity: 1,
      });

      if (response.success) {
        toast.success(`Đã thêm "${product.name}" vào giỏ hàng.`);
      } else {
        toast.error(response.message || 'Không thể thêm sản phẩm.');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Không thể thêm sản phẩm. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const imageUrl = product.mainImage?.startsWith('http') 
    ? product.mainImage 
    : product.mainImage 
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${product.mainImage}`
      : null;

  return (
    <div className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      <Link href={`/chi-tiet-san-pham/${product.slug}`} className="flex flex-col flex-1">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-sm">Không có ảnh</span>
            </div>
          )}
          
          {/* Discount Badge */}
          {product.discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white font-semibold text-xs">
              -{product.discount}%
            </Badge>
          )}

          {/* Stock Status */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold bg-red-600 px-3 py-1 rounded">
                Hết hàng
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            {/* Category */}
            <div className="text-xs text-green-600 font-medium uppercase tracking-wide">
              {product.category.name}
            </div>

            {/* Product Name */}
            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors text-sm leading-tight h-10">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center space-x-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                ({product.totalReviews})
              </span>
            </div>
          </div>

          {/* Price Section */}
          <div className="space-y-2 mt-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-green-600">
                {product.finalPrice.toLocaleString('vi-VN')}đ
              </span>
              {product.discount > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  {product.price.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>
            {product.discount > 0 && (
              <div className="text-xs text-red-600 font-medium">
                Tiết kiệm {(product.price - product.finalPrice).toLocaleString('vi-VN')}đ
              </div>
            )}

            {/* Stock Info & Sold Count */}
            <div className="flex items-center justify-between text-xs">
              <div className="text-gray-500">
                {product.stock > 0 ? (
                  <span>Còn {product.stock} sản phẩm</span>
                ) : (
                  <span className="text-red-500 font-medium">Hết hàng</span>
                )}
              </div>
              {product.soldCount > 0 && (
                <div className="text-gray-600 font-medium">
                  Đã bán: {product.soldCount}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="p-4 pt-0 mt-auto">
        <Button
          onClick={handleAddToCart}
          disabled={isLoading || product.stock === 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium h-9"
          size="sm"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <ShoppingCart className="w-4 h-4 mr-2" />
          )}
          {product.stock === 0 ? 'Hết hàng' : isLoading ? 'Đang thêm...' : 'Thêm vào giỏ'}
        </Button>
      </div>
    </div>
  );
}