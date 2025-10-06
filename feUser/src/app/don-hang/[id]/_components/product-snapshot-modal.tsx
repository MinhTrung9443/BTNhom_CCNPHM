"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs, Zoom } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight, ZoomIn, ExternalLink, Camera, Package, Tag, Star, Eye, TrendingUp, Clock } from "lucide-react";
import type { OrderLine } from "@/types/order";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/zoom";

interface ProductSnapshotModalProps {
  orderLine: OrderLine;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(dateString));
};

export function ProductSnapshotModal({ orderLine, open, onOpenChange }: ProductSnapshotModalProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!orderLine.productSnapshot) return null;

  const snapshot = orderLine.productSnapshot;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 border-b sticky top-0 bg-background/95 backdrop-blur z-10">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  <DialogTitle className="text-xl">Ảnh Chụp Nhanh Sản Phẩm</DialogTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Đây là thông tin sản phẩm tại thời điểm bạn đặt hàng
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(snapshot.capturedAt)}</span>
                </div>
              </div>
              <Button asChild size="sm">
                <Link href={`/chi-tiet-san-pham/${snapshot.slug}`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Xem trực tiếp
                </Link>
              </Button>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-2 p-6">
          {/* Left: Images with Swiper */}
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
                {snapshot.images.map((image, index) => (
                  <SwiperSlide key={index}>
                    <div className="swiper-zoom-container">
                      <div className="relative w-full h-full flex items-center justify-center">
                        <Image
                          src={image}
                          alt={`${snapshot.name} - Ảnh ${index + 1}`}
                          width={600}
                          height={600}
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
              {snapshot.images.length > 1 && (
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
              {snapshot.images.length > 1 && (
                <div className="absolute bottom-4 left-4 z-10 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full font-medium">
                  {activeIndex + 1} / {snapshot.images.length}
                </div>
              )}
            </div>

            {/* Thumbnails Swiper */}
            {snapshot.images.length > 1 && (
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
                }}
              >
                {snapshot.images.map((image, index) => (
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

          {/* Right: Details */}
          <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Product Name & Badges */}
            <div>
              <h2 className="text-2xl font-bold mb-3">{snapshot.name}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {snapshot.code}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {snapshot.categoryName}
                </Badge>
                {snapshot.isActive ? <Badge className="bg-green-600">Đang bán</Badge> : <Badge variant="destructive">Ngừng bán</Badge>}
              </div>
            </div>

            <Separator />

            {/* Price Section */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">{formatPrice(snapshot.price)}</span>
                {snapshot.discount > 0 && (
                  <Badge variant="destructive" className="text-base px-3 py-1">
                    -{snapshot.discount}%
                  </Badge>
                )}
              </div>
              {snapshot.discount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Giá sau giảm:</span>
                  <span className="font-bold text-xl text-green-600">{formatPrice(snapshot.price * (1 - snapshot.discount / 100))}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="shadow-sm">
                <CardContent className="p-3 flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tồn kho</p>
                    <p className="text-base font-bold">{snapshot.stock}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-3 flex items-center gap-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Đã bán</p>
                    <p className="text-base font-bold">{snapshot.soldCount}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-3 flex items-center gap-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Lượt xem</p>
                    <p className="text-base font-bold">{snapshot.viewCount}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-3 flex items-center gap-2">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Đánh giá</p>
                    <p className="text-base font-bold">
                      {snapshot.averageRating.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">({snapshot.totalReviews})</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold text-base mb-2">Mô tả sản phẩm</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{snapshot.description}</p>
            </div>

            <Separator />

            {/* Snapshot Info Alert */}
            <Card className="border-primary/50 bg-primary/5 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Camera className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-semibold text-primary text-sm">Thông tin ảnh chụp nhanh</p>
                    <p className="text-xs text-muted-foreground">
                      Ảnh chụp nhanh này lưu lại thông tin sản phẩm tại thời điểm bạn đặt hàng. Thông tin hiện tại của sản phẩm có thể đã thay đổi.
                    </p>
                  </div>
                </div>
                <Button asChild className="w-full" variant="outline" size="sm">
                  <Link href={`/chi-tiet-san-pham/${snapshot.slug}`} target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Xem thông tin sản phẩm hiện tại
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
