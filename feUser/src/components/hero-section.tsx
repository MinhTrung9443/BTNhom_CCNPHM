"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const router = useRouter();

  const scrollToProducts = () => {
    const productsSection = document.getElementById("products-section");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const goToAbout = () => {
    router.push("/about");
  };

  return (
    <section className="relative bg-gradient-to-br from-emerald-600 via-green-700 to-teal-800 overflow-hidden">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-green-600/20 via-transparent to-orange-500/10 animate-pulse"></div>

      {/* Geometric pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgPGcgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjA1Ij4KICAgICAgPHBhdGggZD0iTTAgMGg0MHY0MEgwek00MCA0MGg0MHY0MEg0MHoiLz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPg==')] opacity-30"></div>

      {/* Gradient mesh effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(251,146,60,0.15),transparent_50%)]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <div className="text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <span className="text-white/90 text-sm font-medium">🌾 Hương vị truyền thống miền Tây</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            Đặc Sản
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-amber-200 to-yellow-300">Sóc Trăng</span>
          </h1>

          <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow">
            Khám phá hương vị đậm đà của miền Tây Nam Bộ với những món đặc sản truyền thống được chế biến từ nguyên liệu tươi ngon nhất
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Button
              size="lg"
              onClick={scrollToProducts}
              className="bg-white text-green-700 hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer pointer-events-auto"
              suppressHydrationWarning
            >
              Khám Phá Sản Phẩm
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={goToAbout}
              className="border-2 border-white/80 bg-transparent text-white hover:text-white hover:bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer pointer-events-auto"
              suppressHydrationWarning
            >
              Tìm Hiểu Thêm
            </Button>
          </div>
        </div>

        {/* Decorative floating elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-32 h-32 bg-orange-300/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-200/10 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Bottom wave separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="rgb(248 250 252)"
            fillOpacity="1"
          />
        </svg>
      </div>
    </section>
  );
}
