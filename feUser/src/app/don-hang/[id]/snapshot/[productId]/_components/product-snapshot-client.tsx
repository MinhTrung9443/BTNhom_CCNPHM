"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs, Zoom } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/zoom";

interface ProductSnapshotClientProps {
  images: string[];
  productName: string;
}

export function ProductSnapshotClient({ images, productName }: ProductSnapshotClientProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="space-y-4">
      {/* Main Swiper */}
      <div className="relative group">
        <Swiper
          spaceBetween={10}
          navigation={{
            prevEl: ".swiper-button-prev-custom",
            nextEl: ".swiper-button-next-custom",
          }}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          modules={[FreeMode, Navigation, Thumbs, Zoom]}
          zoom={true}
          className="rounded-lg overflow-hidden bg-gray-100 aspect-square"
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="swiper-zoom-container">
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={image}
                    alt={`${productName} - Ảnh ${index + 1}`}
                    width={800}
                    height={800}
                    unoptimized
                    className="object-contain max-h-full"
                    priority={index === 0}
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              className="swiper-button-prev-custom absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-gray-800" />
            </button>
            <button
              className="swiper-button-next-custom absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 text-gray-800" />
            </button>
          </>
        )}

        {/* Zoom Hint */}
        <div className="absolute bottom-4 right-4 z-10 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="h-3 w-3" />
          <span>Click để phóng to</span>
        </div>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-4 z-10 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full font-medium">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails Swiper */}
      {images.length > 1 && (
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={10}
          slidesPerView={4}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs]}
          className="thumbs-swiper"
          breakpoints={{
            640: {
              slidesPerView: 5,
            },
            768: {
              slidesPerView: 6,
            },
          }}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div
                className={`relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer border-2 transition-all ${
                  activeIndex === index ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-gray-300"
                }`}
              >
                <Image src={image} alt={`Thumbnail ${index + 1}`} fill unoptimized className="object-cover" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
