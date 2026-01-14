'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

export interface VendorCardData {
  id: string;
  name: string;
  logo: string;
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
}

export function VendorCard({ vendor, index = 0 }: VendorCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
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

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const hasMultipleImages = vendor.images.length > 1;

  return (
    <Link href={`/vendor/${vendor.id}`}>
      <article
        className="group cursor-pointer animate-fade-in"
        style={{ animationDelay: `${index * 50}ms` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
          {/* Featured Badge */}
          {vendor.isFeatured && (
            <div className="absolute top-3 left-3 z-10 bg-white px-3 py-1 rounded-full shadow-sm">
              <span className="text-xs font-medium text-gray-900">Featured</span>
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full hover:scale-110 transition-transform"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorite
                  ? 'fill-red-500 text-red-500'
                  : 'fill-black/30 text-white stroke-2'
              }`}
            />
          </button>

          {/* Image Carousel */}
          <div
            ref={imageContainerRef}
            className="relative w-full h-full"
          >
            {(() => {
              const imageSrc = vendor.images.length > 0 && vendor.images[currentImageIndex]
                ? vendor.images[currentImageIndex]
                : '/placeholder.jpg';
              
              // Validate URL - must be http/https URL or absolute path starting with /
              const isValidUrl = imageSrc && (
                imageSrc.startsWith('http://') || 
                imageSrc.startsWith('https://') || 
                imageSrc.startsWith('/')
              );
              
              const finalSrc = isValidUrl ? imageSrc : '/placeholder.jpg';
              
              return (
                <Image
                  src={finalSrc}
                  alt={vendor.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
        </div>

        {/* Content */}
        <div className="mt-3 space-y-1">
          {/* Title */}
          <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
            {vendor.name}
          </h3>

          {/* Rating */}
          {vendor.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-900 font-medium">
                {vendor.rating.toFixed(1)} ({vendor.reviewCount})
              </span>
            </div>
          )}

          {/* Location */}
          <p className="text-xs text-gray-600">{vendor.location}</p>

          {/* Category */}
          <p className="text-xs text-gray-600">{vendor.category}</p>
        </div>
      </article>
    </Link>
  );
}

// Skeleton loader for vendor card
export function VendorCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] rounded-xl bg-gray-200" />
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  );
}
