'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, X, Grid3X3, Share, Heart, ArrowLeft } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  vendorName: string;
}

/**
 * Check if a URL is a local/private IP that Next.js Image blocks
 */
function isLocalUrl(url: string): boolean {
  return url.includes('127.0.0.1') || url.includes('localhost:8000');
}

export function ImageGallery({ images, vendorName }: ImageGalleryProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleBack = () => {
    router.back();
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left - next image
        handleNext();
      } else {
        // Swipe right - previous image
        handlePrev();
      }
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsModalOpen(false);
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
  };

  // Show only 3 images in the grid (1 large + 2 small)
  const displayImages = images.slice(0, 3);
  const hasMoreImages = images.length > 3;

  if (images.length === 0) {
    return (
      <div className="w-full min-h-[100px] md:min-h-[400px] flex items-center justify-center">
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Carousel */}
      <div className="md:hidden relative">
        <div
          className="relative aspect-[4/3] overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[currentIndex]}
            alt={`${vendorName} - Image ${currentIndex + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
          />


          {/* Counter Pagination */}
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded-full">
            {currentIndex + 1}/{images.length}
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={handleBack}
          className="absolute top-3 left-3 h-9 w-9 bg-white rounded-full flex items-center justify-center shadow-md"
        >
          <ArrowLeft className="h-5 w-5 text-gray-900" />
        </button>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button className="h-9 w-9 bg-white rounded-full flex items-center justify-center shadow-md">
            <Share className="h-4 w-4 text-gray-700" />
          </button>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="h-9 w-9 bg-white rounded-full flex items-center justify-center shadow-md"
          >
            <Heart
              className={`h-4 w-4 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Desktop Grid - 3 images layout */}
      <div className="hidden md:block h-135">
        <div className="grid grid-cols-[19fr_9fr] gap-6 h-full">
          {/* Large image on left */}
          <div
            className="relative cursor-pointer group h-full overflow-hidden rounded-xl"
            onClick={() => {
              setCurrentIndex(0);
              setIsModalOpen(true);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayImages[0]}
              alt={`${vendorName} - Image 1`}
              className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl" />
          </div>

          {/* Two smaller images on right - stacked */}
          <div className="flex flex-col gap-5 h-full">
            {displayImages.slice(1, 3).map((img, index) => (
              <div
                key={index + 1}
                className="relative cursor-pointer group flex-1 min-h-0 overflow-hidden rounded-xl"
                onClick={() => {
                  setCurrentIndex(index + 1);
                  setIsModalOpen(true);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`${vendorName} - Image ${index + 2}`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl" />

                {/* Show All Photos Button on last image */}
                {index === 1 && hasMoreImages && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsModalOpen(true);
                    }}
                    className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 text-sm font-medium hover:scale-105 transition-transform"
                  >
                    <Grid3X3 className="h-4 w-4" />
                    See all images
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Screen Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onKeyDown={(e) => handleKeyDown(e as unknown as KeyboardEvent)}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 left-4 text-white p-2 hover:bg-white/10 rounded-full z-10"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Navigation */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          {/* Image */}
          <div className="relative w-full h-full max-w-5xl max-h-[80vh] mx-4 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[currentIndex]}
              alt={`${vendorName} - Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full"
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          {/* Thumbnails */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full px-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-16 h-12 rounded overflow-hidden shrink-0 ${
                  idx === currentIndex ? 'ring-2 ring-white' : 'opacity-60'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
