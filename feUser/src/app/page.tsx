import { Suspense } from 'react';
import HeroSection from '@/components/hero-section';
import ProductSection from '@/components/product-section';
import { productService } from '@/services/productService'; // Dùng service mới
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
  const response = await productService.getLatestProducts();
  const products = response.success ? response.data.products : [];

  return (
    <ProductSection
      title="Sản Phẩm Nổi Bật"
      products={products}
    />
  );
}

async function BestsellersSection() {
    const response = await productService.getBestsellerProducts();
    const products = response.success ? response.data.products : [];
    return (
        <ProductSection
            title="Sản Phẩm Bán Chạy"
            products={products}
        />
    )
}

// ... các section khác tương tự

export default function Home() {
  return (
    <main>
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4">
        <Suspense fallback={<ProductSectionSkeleton />}>
          <FeaturedSection />
        </Suspense>
        <Suspense fallback={<ProductSectionSkeleton />}>
            <BestsellersSection />
        </Suspense>
        {/* Các section sản phẩm khác */}
      </div>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ST</span>
                </div>
                <span className="font-bold text-xl">Đặc Sản Sóc Trăng</span>
              </div>
              <p className="text-gray-400">
                Mang đến cho bạn những món đặc sản truyền thống tốt nhất từ vùng đất Sóc Trăng.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Sản Phẩm</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Bánh Pía</li>
                <li>Kẹo Dừa</li>
                <li>Bánh Tráng</li>
                <li>Đặc Sản Khác</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Thông Tin</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Giới Thiệu</li>
                <li>Liên Hệ</li>
                <li>Chính Sách</li>
                <li>Hỗ Trợ</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Liên Hệ</h4>
              <div className="space-y-2 text-gray-400">
                <p>📍 Sóc Trăng, Việt Nam</p>
                <p>📞 0123 456 789</p>
                <p>✉️ info@dacsansoctrang.vn</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Đặc Sản Sóc Trăng. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}