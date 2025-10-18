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
      {/* About Section - Added from about page */}
      <section className="bg-white py-16 scroll-mt-20" id="about-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* About Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Câu Chuyện Của Chúng Tôi
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Sóc Trăng, vùng đất phù sa màu mỡ của miền Tây Nam Bộ, đã nuôi dưỡng 
                  những món đặc sản với hương vị độc đáo qua hàng trăm năm lịch sử. 
                  Chúng tôi tự hào mang đến cho quý khách những sản phẩm chất lượng nhất 
                  từ vùng đất này.
                </p>
                <p>
                  Với sứ mệnh bảo tồn và phát triển các công thức truyền thống, 
                  chúng tôi cam kết sử dụng nguyên liệu tươi ngon nhất, 
                  kết hợp với kỹ thuật chế biến hiện đại để tạo ra những sản phẩm 
                  vừa giữ được hương vị truyền thống vừa đảm bảo tiêu chuẩn an toàn thực phẩm.
                </p>
              </div>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden">
              <img
                src="https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Bánh pía Sóc Trăng truyền thống"
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Products Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Các Sản Phẩm Đặc Trưng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Bánh Pía */}
              <div className="text-center">
                <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Bánh Pía Sóc Trăng"
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Bánh Pía</h3>
                <p className="text-gray-600">
                  Món đặc sản nổi tiếng nhất của Sóc Trăng với vỏ bánh mỏng, 
                  nhân thơm ngon từ sầu riêng, đậu xanh hay thịt nướng.
                </p>
              </div>

              {/* Kẹo Dừa */}
              <div className="text-center">
                <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Kẹo Dừa"
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Kẹo Dừa</h3>
                <p className="text-gray-600">
                  Kẹo dừa thơm béo, ngọt dịu từ cơm dừa tươi, 
                  được chế biến theo công thức gia truyền.
                </p>
              </div>

              {/* Bánh Tráng */}
              <div className="text-center">
                <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Bánh Tráng"
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Bánh Tráng</h3>
                <p className="text-gray-600">
                  Bánh tráng giòn rụm, được làm từ bột gạo tươi, 
                  có thể thưởng thức trực tiếp hoặc cuốn với các loại rau củ.
                </p>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="bg-green-50 rounded-2xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Giá Trị Cốt Lõi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🌿</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Tự Nhiên</h3>
                <p className="text-gray-600">
                  Sử dụng 100% nguyên liệu tự nhiên, không chất bảo quản có hại
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">⭐</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chất Lượng</h3>
                <p className="text-gray-600">
                  Cam kết về chất lượng từ khâu chọn nguyên liệu đến thành phẩm
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🏛️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Truyền Thống</h3>
                <p className="text-gray-600">
                  Giữ gín và phát huy những công thức chế biến truyền thống
                </p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Liên Hệ Với Chúng Tôi
            </h2>
            <p className="text-gray-700 mb-8">
              Chúng tôi luôn sẵn sàng lắng nghe và phục vụ quý khách hàng tốt nhất
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Địa Chỉ</h4>
                <p className="text-gray-600">Sóc Trăng, Việt Nam</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Điện Thoại</h4>
                <p className="text-gray-600">0123 456 789</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Email</h4>
                <p className="text-gray-600">info@dacsansoctrang.vn</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-60 to-green-700 rounded-lg flex items-center justify-center">
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
