"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/favorite-button";
import { userService } from "@/services/userService";
import { FavoriteProduct } from "@/types/favorite";
import { toast } from "sonner";

interface FavoritesClientProps {
  accessToken: string;
}

function FavoriteItem({ product }: { product: FavoriteProduct }) {
  const productUrl = `/chi-tiet-san-pham/${product.slug || product._id}`;
  const imageUrl = product.images?.[0] || "https://placehold.co/400x400/e5e7eb/6b7280?text=No+Image";
  const discountPercent = product.discount ? Math.round((product.discount / product.price) * 100) : 0;
  const finalPrice = product.price - (product.discount || 0);

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        <Link href={productUrl} className="relative flex-shrink-0 w-full sm:w-32 h-32 rounded-lg overflow-hidden bg-gray-100 group">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, 128px"
          />
          {discountPercent > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discountPercent}%
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <Link href={productUrl} className="block group">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </Link>
            </div>

            <div className="flex-shrink-0">
              <FavoriteButton productId={product._id} initialIsFavorited={true} />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-green-600">{finalPrice.toLocaleString("vi-VN")}₫</span>
              {product.discount && product.discount > 0 && (
                <span className="text-sm text-gray-400 line-through">{product.price.toLocaleString("vi-VN")}₫</span>
              )}
            </div>

            <Link
              href={productUrl}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FavoritesClient({ accessToken }: FavoritesClientProps) {
  const [products, setProducts] = useState<FavoriteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current: 1,
    limit: 10,
    total: 0,
    totalItems: 0,
  });

  const fetchFavorites = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await userService.getFavorites(accessToken, page, 5, search || undefined);
      console.log(response);
      if (response.success) {
        setProducts(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        toast.error("Lỗi", { description: response.message });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Không thể tải danh sách yêu thích";
      toast.error("Lỗi", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, page, search]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!isLoading && products.length === 0 && !search) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Heart className="mx-auto h-16 w-16 text-gray-400" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Danh sách trống</h1>
          <p className="mt-2 text-base text-gray-600 max-w-md mx-auto">
            Bạn chưa có sản phẩm yêu thích nào. Hãy khám phá và thêm sản phẩm nhé!
          </p>
          <Link
            href="/"
            className="mt-6 inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="h-8 w-8 text-red-500 fill-red-500" />
          <h1 className="text-3xl font-bold text-gray-900">Sản phẩm yêu thích</h1>
        </div>
        <p className="text-gray-600 mb-4">
          Bạn có <span className="font-semibold text-green-600">{pagination.totalItems}</span> sản phẩm yêu thích
        </p>

        <div className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tìm kiếm"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Không tìm thấy sản phẩm nào phù hợp với từ khóa "{search}"</p>
          <Button
            onClick={() => {
              setSearch("");
              setSearchInput("");
              setPage(1);
            }}
            variant="outline"
            className="mt-4"
          >
            Xóa bộ lọc
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {products.map((product) => (
              <FavoriteItem key={product._id} product={product} />
            ))}
          </div>

          {pagination.total > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || isLoading} variant="outline">
                Trang trước
              </Button>
              <span className="text-sm text-gray-600">
                Trang {pagination.current} / {pagination.total}
              </span>
              <Button
                onClick={() => setPage((p) => Math.min(pagination.total, p + 1))}
                disabled={page === pagination.total || isLoading}
                variant="outline"
              >
                Trang sau
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
