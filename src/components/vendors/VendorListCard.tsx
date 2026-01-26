'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { VendorCardData } from '@/components/home/VendorCard';

interface VendorListCardProps {
  vendor: VendorCardData;
  isHighlighted?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function VendorListCard({
  vendor,
  isHighlighted = false,
  onMouseEnter,
  onMouseLeave,
}: VendorListCardProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

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

  // Get valid image source
  const getImageSrc = () => {
    const imageSrc = vendor.images.length > 0 && vendor.images[currentImageIndex]
      ? vendor.images[currentImageIndex]
      : '/placeholder.svg';

    const isValidUrl = imageSrc && (
      imageSrc.startsWith('http://') ||
      imageSrc.startsWith('https://') ||
      imageSrc.startsWith('/')
    );

    return isValidUrl ? imageSrc : '/placeholder.svg';
  };

  // Format duration (minutes to hours/minutes)
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} hr ${mins} mins` : `${hours} hr`;
  };

  // Get display services (max 3)
  const displayServices = vendor.services?.slice(0, 3) || [];

  return (
    <Link href={`/vendor/${vendor.id}`}>
      <article
        id={`vendor-${vendor.id}`}
        className={`
          group flex flex-col cursor-pointer transition-all duration-200
          ${isHighlighted ? 'scale-[1.02]' : ''}
        `}
        onMouseEnter={() => {
          setIsHovered(true);
          onMouseEnter?.();
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          onMouseLeave?.();
        }}
      >
        {/* Image Section */}
        <div className="relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getImageSrc()}
            alt={vendor.name}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              vendor.isOpenAtSelectedTime === false ? 'opacity-70' : ''
            }`}
          />

          {/* Closed Badge */}
          {vendor.isOpenAtSelectedTime === false && (
            <div className="absolute top-3 left-3 z-10">
              <span className="px-2.5 py-1 bg-gray-900 text-white text-xs font-medium rounded-full">
                Closed
              </span>
            </div>
          )}

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
                    idx === currentImageIndex ? 'bg-white w-2' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="pt-3 flex flex-col">
          {/* Header: Name and Rating */}
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <h3 className="font-semibold text-gray-900 text-base line-clamp-1">
              {vendor.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-gray-900">
                {(vendor.rating || 0).toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">
                ({vendor.reviewCount || 0})
              </span>
            </div>
          </div>

          {/* Distance and Location */}
          <p className="text-sm text-gray-500 line-clamp-1">
            {vendor.distanceKm !== undefined && vendor.distanceKm > 0 && (
              <span>&gt;{Math.round(vendor.distanceKm)} km · </span>
            )}
            {vendor.location || 'Location not available'}
          </p>

          {/* Closed notice with booking availability */}
          {vendor.isOpenAtSelectedTime === false && (
            <p className="text-xs text-amber-600 mt-1">
              Closed at this time · Book for another time
            </p>
          )}

          {/* Services List - Gray background cards */}
          {displayServices.length > 0 && (
            <div className="mt-3 space-y-2">
              {displayServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-gray-50 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Store selected service in sessionStorage for the booking page
                    const selectedService = {
                      id: service.id,
                      name: service.name,
                      price: service.price,
                      originalPrice: service.price,
                      duration: service.duration || 0,
                      category: vendor.category || 'Service',
                    };
                    sessionStorage.setItem(
                      `booking_${vendor.id}_services`,
                      JSON.stringify([selectedService])
                    );
                    router.push(`/booking/${vendor.id}`);
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{service.name}</p>
                      {service.duration && (
                        <p className="text-sm text-gray-500 mt-0.5">{formatDuration(service.duration)}</p>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 shrink-0">
                      {service.price === 0 ? (
                        <span className="text-gray-600">free</span>
                      ) : (
                        <>from AED {service.price}</>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* See all services link */}
          {vendor.totalServices && vendor.totalServices > 0 && (
            <p className="mt-3 text-sm text-blue-600 font-medium">
              See all {vendor.totalServices} services
            </p>
          )}

          {/* Fallback if no services */}
          {displayServices.length === 0 && (
            <div className="mt-3">
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">from AED {vendor.startingPrice}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

// Skeleton loader for vendor list card
export function VendorListCardSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      {/* Image Section */}
      <div className="w-full aspect-video bg-gray-200 rounded-xl" />

      {/* Content Section */}
      <div className="pt-3">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="h-5 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/2" />

        {/* Service skeletons */}
        <div className="mt-3 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg px-4 py-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/4 mt-1" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-20" />
              </div>
            </div>
          ))}
        </div>

        <div className="h-4 bg-gray-200 rounded w-32 mt-3" />
      </div>
    </div>
  );
}
