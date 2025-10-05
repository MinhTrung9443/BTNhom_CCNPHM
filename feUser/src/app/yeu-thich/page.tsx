import { Suspense } from 'react';
import { auth } from '@/auth';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { userService } from '@/services/userService';
import { FavoriteProduct } from '@/types/favorite';
import Loading from './loading';
import { FavoriteButton } from '@/components/favorite-button';

export const metadata = {
  title: 'Sản phẩm yêu thích',
  description: 'Danh sách các sản phẩm bạn đã yêu thích.',
};

export default async function FavoritesPage() {
  const session = await auth();

  if (!session || !session.user?.accessToken) {
    return (
      <div className="text-center py-12">
        <Heart className="mx-auto h-16 w-16 text-gray-400" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Danh sách yêu thích của bạn
        </h1>
        <p className="mt-2 text-base text-gray-600">
          Vui lòng đăng nhập để xem các sản phẩm bạn đã lưu.
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <FavoritesList accessToken={session.user.accessToken} />
    </Suspense>
  );
}

function FavoriteItem({ product }: { product: FavoriteProduct }) {
  const productUrl = `/chi-tiet-san-pham/${product.slug || product._id}`;
  const imageUrl = product.images?.[0] || 'https://placehold.co/400x400/e5e7eb/6b7280?text=No+Image';
  const discountPercent = product.discount ? Math.round((product.discount / product.price) * 100) : 0;
  const finalPrice = product.price - (product.discount || 0);

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        {/* Image */}
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

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <Link href={productUrl} className="block group">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              
              {product.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
              )}
            </div>

            {/* Favorite Button */}
            <div className="flex-shrink-0">
              <FavoriteButton productId={product._id} initialIsFavorited={true} />
            </div>
          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between mt-4 gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-green-600">
                {finalPrice.toLocaleString('vi-VN')}₫
              </span>
              {product.discount && product.discount > 0 && (
                <span className="text-sm text-gray-400 line-through">
                  {product.price.toLocaleString('vi-VN')}₫
                </span>
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

async function FavoritesList({ accessToken }: { accessToken: string }) {
  const response = await userService.getFavorites(accessToken);
  const favoriteProducts = response.success ? response.data : [];

  if (favoriteProducts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Heart className="mx-auto h-16 w-16 text-gray-400" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Danh sách trống
          </h1>
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="h-8 w-8 text-red-500 fill-red-500" />
          <h1 className="text-3xl font-bold text-gray-900">Sản phẩm yêu thích</h1>
        </div>
        <p className="text-gray-600">
          Bạn có <span className="font-semibold text-green-600">{favoriteProducts.length}</span> sản phẩm yêu thích
        </p>
      </div>

      {/* List Items */}
      <div className="space-y-4">
        {favoriteProducts.map(product => (
          <FavoriteItem key={product._id} product={product} />
        ))}
      </div>
    </>
  );
}