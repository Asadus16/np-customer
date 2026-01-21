'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { VendorCard, VendorCardData, VendorCardSkeleton } from './VendorCard';

interface VendorSectionProps {
  title: string;
  subtitle?: string;
  vendors: VendorCardData[];
  isLoading?: boolean;
  viewAllLink?: string;
  layout?: 'scroll' | 'grid';
}

export function VendorSection({
  title,
  subtitle,
  vendors,
  isLoading = false,
  viewAllLink,
  layout = 'scroll',
}: VendorSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setScrollPosition(scrollLeft);
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, [checkScrollPosition, vendors]);

  const handleScroll = useCallback((direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 400;
    const newPosition = direction === 'left'
      ? scrollPosition - scrollAmount
      : scrollPosition + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth',
    });
  }, [scrollPosition]);

  // Loading state
  if (isLoading) {
    return (
      <section className="py-8">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start mb-6">
            <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className={layout === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
            : 'flex gap-4 overflow-hidden'
          }>
            {Array.from({ length: layout === 'grid' ? 8 : 5 }).map((_, i) => (
              <div key={i} className={layout === 'scroll' ? 'flex-shrink-0 w-64' : ''}>
                <VendorCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (vendors.length === 0) {
    return (
      <section className="py-8">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No vendors available at the moment</p>
          </div>
        </div>
      </section>
    );
  }

  // Grid layout
  if (layout === 'grid') {
    return (
      <section className="py-8">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
            {viewAllLink && (
              <Link
                href={viewAllLink}
                className="text-sm font-medium text-gray-900 hover:underline flex items-center gap-1"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
            {vendors.map((vendor, index) => (
              <VendorCard key={vendor.id} vendor={vendor} index={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Scroll layout (default)
  return (
    <section className="py-8">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="text-sm font-medium text-gray-900 hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Scrollable Container */}
        <div className="relative">
          {/* Left Scroll Button */}
          {canScrollLeft && (
            <button
              onClick={() => handleScroll('left')}
              className="absolute left-2 top-1/2 -translate-y-[calc(50%+2rem)] z-10 h-9 w-9 bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
          )}

          {/* Vendor Cards */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollPosition}
            className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth pb-2 justify-start animate-fade-in justify-between"
          >
            {vendors.map((vendor, index) => (
              <div key={vendor.id} className="flex-shrink-0 w-[340px]">
                <VendorCard vendor={vendor} index={index} />
              </div>
            ))}
          </div>

          {/* Right Scroll Button */}
          {canScrollRight && (
            <button
              onClick={() => handleScroll('right')}
              className="absolute right-2 top-1/2 -translate-y-[calc(50%+2rem)] z-10 h-9 w-9 bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
