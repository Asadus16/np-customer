'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Star, ChevronLeft, ChevronRight, MapPin, Heart } from 'lucide-react';

export interface VendorCardData {
  id: string;
  name: string;
  logo: string | null;
  initials?: string;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  location: string;
  startingPrice: number;
  isVerified?: boolean;
  isFeatured?: boolean;
}

interface VendorCardProps {
  vendor: VendorCardData;
  index?: number;
  href?: string;
  isFavorited?: boolean;
}

export function VendorCard({ vendor, index = 0, href, isFavorited = false }: VendorCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : vendor.images.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev < vendor.images.length - 1 ? prev + 1 : 0));
  };

  const hasMultipleImages = vendor.images.length > 1;
  const cardHref = href || `/vendor/${vendor.id}`;

  return (
    <Link href={cardHref}>
      <article
        className="group cursor-pointer w-full h-auto lg:h-[265px] flex flex-col rounded-xl overflow-hidden !bg-transparent"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-video lg:aspect-auto lg:h-44 overflow-hidden bg-gray-100 rounded-xl">
          {/* Image Carousel */}
          <div
            ref={imageContainerRef}
            className="relative w-full h-full"
          >
            {(() => {
              const imageSrc = vendor.images.length > 0 && vendor.images[currentImageIndex]
                ? vendor.images[currentImageIndex]
                : '/placeholder.svg';

              // Validate URL - must be http/https URL or absolute path starting with /
              const isValidUrl = imageSrc && (
                imageSrc.startsWith('http://') ||
                imageSrc.startsWith('https://') ||
                imageSrc.startsWith('/')
              );

              const finalSrc = isValidUrl ? imageSrc : '/placeholder.svg';

              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={finalSrc}
                  alt={vendor.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 "
                />
              );
            })()}
          </div>

          {/* Navigation Arrows */}
          {hasMultipleImages && isHovered && (
            <>
              {currentImageIndex > 0 && (
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-105"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-700" />
                </button>
              )}
              {currentImageIndex < vendor.images.length - 1 && (
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-105"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4 text-gray-700" />
                </button>
              )}
            </>
          )}

          {/* Image Indicators */}
          {hasMultipleImages && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {vendor.images.slice(0, 5).map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex
                      ? 'bg-white w-2'
                      : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Favorite Heart Icon */}
          {isFavorited && (
            <div className="absolute top-3 right-3 z-10">
              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-1 lg:px-3 pb-3 pt-2 lg:h-[90px] flex flex-col rounded-b-xl bg-transparent">
          <div className="flex items-center justify-between">
            {/* Title */}
            <h3 className="font-bold text-gray-900 text-base line-clamp-1">
              {vendor.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-900 font-medium">
                {(vendor.rating || 0).toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">
                ({vendor.reviewCount || 0})
              </span>
            </div>
          </div>

          <div className="space-y-0.5">
            {/* Location */}
            <p className="text-sm text-gray-600 line-clamp-1">{vendor.location || 'Location not available'}</p>

            {/* Category */}
            <p className="text-sm text-gray-600 line-clamp-1">{vendor.category}</p>
          </div>
        </div>
      </article>
    </Link>
  );
}

// Skeleton loader for vendor card
export function VendorCardSkeleton() {
  return (
    <div className="animate-pulse w-[382px] h-[282px] flex flex-col">
      <div className="h-[210px] rounded-xl bg-gray-200" />
      <div className="mt-3 space-y-2 flex-shrink-0">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  );
}
