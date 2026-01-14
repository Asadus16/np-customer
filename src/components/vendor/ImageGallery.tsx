'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Grid3X3, Share, Heart } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  vendorName: string;
}

export function ImageGallery({ images, vendorName }: ImageGalleryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

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

  // Show up to 5 images in the grid
  const displayImages = images.slice(0, 5);
  const hasMoreImages = images.length > 5;

  if (images.length === 0) {
    return (
      <div className="w-full aspect-[2/1] bg-gray-200 rounded-xl flex items-center justify-center">
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Carousel */}
      <div className="md:hidden relative">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
          <Image
            src={images[currentIndex]}
            alt={`${vendorName} - Image ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority
          />

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/90 rounded-full flex items-center justify-center shadow-md"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/90 rounded-full flex items-center justify-center shadow-md"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>
            </>
          )}

          {/* Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button className="h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-md">
            <Share className="h-4 w-4 text-gray-700" />
          </button>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-md"
          >
            <Heart
              className={`h-4 w-4 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:block">
        <div className="grid-areas rounded-xl overflow-hidden">
          {displayImages.map((img, index) => (
            <div
              key={index}
              className={`grid-area-image${index + 1} relative cursor-pointer group`}
              onClick={() => {
                setCurrentIndex(index);
                setIsModalOpen(true);
              }}
            >
              <Image
                src={img}
                alt={`${vendorName} - Image ${index + 1}`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

              {/* Show All Photos Button */}
              {index === 4 && hasMoreImages && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsModalOpen(true);
                  }}
                  className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 text-sm font-medium hover:scale-105 transition-transform"
                >
                  <Grid3X3 className="h-4 w-4" />
                  Show all photos
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-4">
          <button className="flex items-center gap-2 text-sm font-medium hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
            <Share className="h-4 w-4" />
            Share
          </button>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="flex items-center gap-2 text-sm font-medium hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
          >
            <Heart
              className={`h-4 w-4 ${
                isFavorite ? 'fill-red-500 text-red-500' : ''
              }`}
            />
            Save
          </button>
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
          <div className="relative w-full h-full max-w-5xl max-h-[80vh] mx-4">
            <Image
              src={images[currentIndex]}
              alt={`${vendorName} - Image ${currentIndex + 1}`}
              fill
              className="object-contain"
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
                className={`relative w-16 h-12 rounded overflow-hidden flex-shrink-0 ${
                  idx === currentIndex ? 'ring-2 ring-white' : 'opacity-60'
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
