'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Xử lý trường hợp images là null hoặc undefined
  const validImages = images && Array.isArray(images) ? images : [];

  if (!validImages || validImages.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <p>No Image</p>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || !isZoomed) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
    setZoomScale(2);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
    setZoomScale(1);
  };

  const handleZoomIn = () => {
    if (zoomScale < 4) {
      setZoomScale(prev => prev + 0.5);
    }
  };

  const handleZoomOut = () => {
    if (zoomScale > 1) {
      setZoomScale(prev => prev - 0.5);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
        <div
          ref={imageContainerRef}
          className="relative w-full h-full"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* All images with opacity control for smooth transitions */}
          {validImages.map((image, index) => (
            <Image
              key={index}
              src={image}
              alt={`${productName} - Image ${index + 1}`}
              fill
              unoptimized
              className="object-cover absolute inset-0 transition-opacity duration-500 ease-in-out"
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{
                opacity: index === currentImage ? 1 : 0,
                transform: isZoomed && index === currentImage ? `scale(${zoomScale})` : 'scale(1)',
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }}
            />
          ))}

          {/* Magnifying Glass Effect */}
          {isZoomed && (
            <div
              className="absolute border-2 border-white rounded-full pointer-events-none"
              style={{
                width: '80px',
                height: '80px',
                left: `${zoomPosition.x}%`,
                top: `${zoomPosition.y}%`,
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 0 4px rgba(255,255,255,0.9), 0 0 20px rgba(0,0,0,0.7)',
                cursor: 'none',
              }}
            >
              <div className="absolute -right-1 -bottom-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6m2-5a7 7 0 11-14 0 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {validImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white transition-opacity opacity-0 group-hover:opacity-100"
              onClick={prevImage}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white transition-opacity opacity-0 group-hover:opacity-100"
              onClick={nextImage}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* Zoom Controls */}
      {isZoomed && (
        <div className="flex justify-center space-x-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoomScale <= 1}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoomScale >= 4}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <div className="flex items-center px-3 py-1 bg-gray-100 rounded-md text-sm font-medium">
            {Math.round(zoomScale * 100)}%
          </div>
        </div>
      )}

      {/* Thumbnail Images */}
      {validImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {validImages.map((image, index) => (
            <button
              key={index}
              className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${index === currentImage ? 'border-green-600' : 'border-transparent hover:border-gray-30'
                }`}
              onClick={() => setCurrentImage(index)}
            >
              <Image
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                unoptimized
                className="object-cover transition-opacity duration-300"
                sizes="(max-width: 768px) 25vw, 12vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
