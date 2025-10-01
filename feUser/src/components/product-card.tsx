'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types/product';
import { cartService } from '@/services/cartService';
import { FavoriteButton } from './favorite-button';

// Kiểu dữ liệu linh hoạt cho ProductCard, chỉ yêu cầu các trường cần thiết
type ProductCardProduct = Pick<Product, '_id' | 'name' | 'price' | 'images' | 'slug'> & Partial<Product>;

interface ProductCardProps {
  product: ProductCardProduct;
  isFavorited: boolean;
}

export default function ProductCard({ product, isFavorited }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Ngăn Link bao ngoài điều hướng
    e.stopPropagation(); // Ngăn các event khác

    if (status !== 'authenticated') {
      toast.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
      router.push(`/login?callbackUrl=${window.location.pathname}`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await cartService.addItem(session.user.accessToken, {
        productId: product._id,
        quantity: 1,
      });

      if (response.success) {
        toast.success(`Đã thêm "${product.name || 'sản phẩm'}" vào giỏ hàng.`);
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

  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0].startsWith('http')
        ? product.images[0]
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}${product.images[0]}`
      : null;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <Link href={`/chi-tiet-san-pham/${product.slug || product._id}`} className="block">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name || 'Ảnh sản phẩm'}
                width={300}
                height={200}
                unoptimized
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Không có ảnh</span>
              </div>
            )}
          </Link>

          <FavoriteButton
            productId={product._id}
            initialIsFavorited={isFavorited}
            className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
          />

          {/* Quick actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 pointer-events-auto"
                onClick={handleAddToCart}
                disabled={isLoading}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isLoading ? 'Đang thêm...' : 'Thêm vào giỏ'}
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      product.rating && i < Math.floor(product.rating.rate)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              {product.rating && <span className="text-sm text-gray-600">({product.rating.count})</span>}
            </div>
          )}

          <Link href={`/chi-tiet-san-pham/${product.slug || product._id}`}>
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-green-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-green-600">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(product.price)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}