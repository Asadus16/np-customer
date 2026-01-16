'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryFreshaProps {
  images: string[];
  vendorName: string;
}

export function ImageGalleryFresha({ images, vendorName }: ImageGalleryFreshaProps) {
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Ensure we have at least 5 images for the grid, pad with placeholder if needed
  const displayImages = [...images];
  while (displayImages.length < 5) {
    displayImages.push('/placeholder.svg');
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setShowLightbox(true);
  };

  const closeLightbox = () => setShowLightbox(false);

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      {/* Fresha-style Image Grid */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] rounded-xl overflow-hidden">
        {/* Large left image - spans 2 columns and 2 rows */}
        <div
          className="col-span-2 row-span-2 relative cursor-pointer group"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={displayImages[0]}
            alt={`${vendorName} - Main`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>

        {/* Top right images */}
        <div
          className="relative cursor-pointer group"
          onClick={() => openLightbox(1)}
        >
          <Image
            src={displayImages[1]}
            alt={`${vendorName} - 2`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>

        <div
          className="relative cursor-pointer group"
          onClick={() => openLightbox(2)}
        >
          <Image
            src={displayImages[2]}
            alt={`${vendorName} - 3`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>

        {/* Bottom right images */}
        <div
          className="relative cursor-pointer group"
          onClick={() => openLightbox(3)}
        >
          <Image
            src={displayImages[3]}
            alt={`${vendorName} - 4`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>

        {/* Last image with "See all images" overlay */}
        <div
          className="relative cursor-pointer group"
          onClick={() => openLightbox(4)}
        >
          <Image
            src={displayImages[4]}
            alt={`${vendorName} - 5`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {images.length > 5 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                See all images
              </span>
            </div>
          )}
          {images.length <= 5 && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 text-white text-sm">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Navigation */}
          <button
            onClick={goPrev}
            className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <button
            onClick={goNext}
            className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          {/* Current Image */}
          <div className="relative w-full h-full max-w-5xl max-h-[80vh] mx-4">
            <Image
              src={images[currentIndex]}
              alt={`${vendorName} - ${currentIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
