'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './product-card';
import { Product } from '@/types/product';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  showFavoriteButton?: boolean;
  effect?: 'slide' | 'coverflow';
  autoplay?: boolean;
  variant?: 'default' | 'bestseller' | 'discount' | 'viewed';
}

export default function ProductCarousel({ 
  title, 
  subtitle, 
  products,
  showFavoriteButton = false,
  effect = 'slide',
  autoplay = false,
  variant = 'default'
}: ProductCarouselProps) {
  const navigationPrevRef = `swiper-button-prev-${title.replace(/\s+/g, '-')}`;
  const navigationNextRef = `swiper-button-next-${title.replace(/\s+/g, '-')}`;

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 relative">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        {subtitle && (
          <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        )}
      </div>

      <div className="relative group">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
          spaceBetween={24}
          slidesPerView={1}
          navigation={{
            prevEl: `.${navigationPrevRef}`,
            nextEl: `.${navigationNextRef}`,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          autoplay={autoplay ? {
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          } : false}
          effect={effect}
          coverflowEffect={effect === 'coverflow' ? {
            rotate: 30,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: false,
          } : undefined}
          centeredSlides={effect === 'coverflow'}
          slideToClickedSlide={true}
          watchSlidesProgress={true}
          grabCursor={true}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 24,
            },
          }}
          className="!pb-12"
        >
          {products.map((product) => (
            <SwiperSlide key={product._id}>
              <ProductCard 
                product={product} 
                showFavoriteButton={showFavoriteButton}
                variant={variant}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        <button
          className={`${navigationPrevRef} absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 disabled:opacity-0`}
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <button
          className={`${navigationNextRef} absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 disabled:opacity-0`}
        >
          <ChevronRight className="w-6 h-6 text-gray-800" />
        </button>
      </div>
    </section>
  );
}
