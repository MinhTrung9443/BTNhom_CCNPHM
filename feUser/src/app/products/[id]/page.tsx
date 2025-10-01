import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ImageGallery from '@/components/image-gallery';
import { getProductById, getAllProducts } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, ShoppingCart, Minus, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({
    id: product.id,
  }));
}

function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      </div>
      
      <div className="space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

async function ProductDetail({ id }: { id: string }) {
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Product Images */}
      <div>
        <ImageGallery images={product.images || [product.image]} productName={product.name || product.title} />
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {product.isNew && (
              <Badge className="bg-blue-600 hover:bg-blue-700">Mới</Badge>
            )}
            {discountPercentage > 0 && (
              <Badge className="bg-red-600 hover:bg-red-700">
                -{discountPercentage}%
              </Badge>
            )}
            {product.isBestseller && (
              <Badge className="bg-orange-600 hover:bg-orange-700">Bán chạy</Badge>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating.rate)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-600">
              {product.rating.rate} ({product.reviews || product.rating.count} đánh giá)
            </span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-green-600">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xl text-gray-500 line-through">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(product.originalPrice)}
              </span>
            )}
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center gap-4 mb-6">
          <span className="font-medium">Số lượng:</span>
          <div className="flex items-center border rounded-lg">
            <Button variant="ghost" size="sm">
              <Minus className="w-4 h-4" />
            </Button>
            <span className="px-4 py-2 border-x min-w-[60px] text-center">1</span>
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={!(product.inStock ?? true)}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {(product.inStock ?? true) ? 'Thêm Vào Giỏ Hàng' : 'Hết Hàng'}
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="w-full border-green-600 text-green-600 hover:bg-green-50"
          >
            <Heart className="w-5 h-5 mr-2" />
            Thêm Vào Yêu Thích
          </Button>
        </div>

        {/* Product Details */}
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Thông Tin Sản Phẩm</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Danh mục:</span>
              <span className="font-medium">{product.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tình trạng:</span>
              <span className={`font-medium ${(product.inStock ?? true) ? 'text-green-600' : 'text-red-600'}`}>
                {(product.inStock ?? true) ? 'Còn hàng' : 'Hết hàng'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params;
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<ProductDetailSkeleton />}>
          <ProductDetail id={params.id} />
        </Suspense>
      </div>
    </main>
  );
}