import { Suspense } from 'react';
import HeroSection from '@/components/hero-section';
import ProductCarousel from '@/components/product-carousel';
import { productService } from '@/services/productService';
import { Skeleton } from '@/components/ui/skeleton';

function ProductSectionSkeleton() {
  return (
    <div className="py-12">
      <div className="text-center mb-8">
        <Skeleton className="h-8 w-64 mx-auto mb-2" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function FeaturedSection() {
  const response = await productService.getLatestProducts({ limit: 12 });
  const products = response.success ? response.data.products : [];

  return (
    <ProductCarousel
      title="✨ Sản Phẩm Mới Nhất"
      subtitle="Những sản phẩm vừa ra mắt và được yêu thích"
      products={products}
      showFavoriteButton={false}
      autoplay={true}
      variant="default"
    />
  );
}

async function BestsellersSection() {
  const response = await productService.getBestsellerProducts({ limit: 12 });
  const products = response.success ? response.data.products : [];
  
  return (
    <ProductCarousel
      title="🔥 Sản Phẩm Bán Chạy"
      subtitle="Top sản phẩm được mua nhiều nhất"
      products={products}
      showFavoriteButton={false}
      variant="bestseller"
    />
  );
}

async function MostViewedSection() {
  const response = await productService.getMostViewedProducts({ limit: 12 });
  const products = response.success ? response.data.products : [];
  
  return (
    <ProductCarousel
      title="👁️ Sản Phẩm Xem Nhiều"
      subtitle="Những sản phẩm được quan tâm nhất"
      products={products}
      showFavoriteButton={false}
      effect="slide"
      variant="viewed"
    />
  );
}

async function TopDiscountsSection() {
  const response = await productService.getTopDiscountProducts({ limit: 12 });
  const products = response.success ? response.data.products : [];
  
  return (
    <ProductCarousel
      title="💰 Giảm Giá Sốc"
      subtitle="Ưu đãi lớn - Giá tốt nhất"
      products={products}
      showFavoriteButton={false}
      autoplay={true}
      variant="discount"
    />
  );
}

export default function Home() {
  return (
    <main className="bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <HeroSection />
      
      {/* Featured Section - White background */}
      <div id="products-section" className="bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <Suspense fallback={<ProductSectionSkeleton />}>
            <FeaturedSection />
          </Suspense>
        </div>
      </div>
      
      {/* Bestsellers Section - Light green tint */}
      <div className="bg-gradient-to-br from-green-50/50 via-emerald-50/30 to-teal-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <Suspense fallback={<ProductSectionSkeleton />}>
            <BestsellersSection />
          </Suspense>
        </div>
      </div>
      
      {/* Most Viewed Section - White background */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <Suspense fallback={<ProductSectionSkeleton />}>
            <MostViewedSection />
          </Suspense>
        </div>
      </div>
      
      {/* Top Discounts Section - Light orange tint */}
      <div className="bg-gradient-to-br from-orange-50/40 via-amber-50/30 to-yellow-50/40">
        <div className="max-w-7xl mx-auto px-4">
          <Suspense fallback={<ProductSectionSkeleton />}>
            <TopDiscountsSection />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
