'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

export interface NearbyVenue {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  location: string;
  category: string;
}

interface VenuesNearbyProps {
  venues: NearbyVenue[];
  title?: string;
}

export function VenuesNearby({ venues, title = 'Venues nearby' }: VenuesNearbyProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition, { passive: true });
      window.addEventListener('resize', checkScrollPosition);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollPosition);
      }
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = 280;
    const scrollAmount = cardWidth * 2;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>

      {venues.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No other venues in this service area yet.</p>
        </div>
      ) : (
        <>

      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 mt-4 -translate-y-1/2 z-10 h-10 w-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
      )}

      {/* Venues Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4"
      >
        {venues.map((venue) => (
          <VenueCard key={venue.id} venue={venue} />
        ))}
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 mt-4 -translate-y-1/2 z-10 h-10 w-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      )}
        </>
      )}
    </div>
  );
}

function VenueCard({ venue }: { venue: NearbyVenue }) {
  return (
    <Link
      href={`/vendor/${venue.id}`}
      className="flex-shrink-0 w-[260px] group"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-3">
        {venue.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={venue.image}
            alt={venue.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 truncate">{venue.name}</h3>
          <p className="text-sm text-gray-500 truncate">{venue.location}</p>
          <p className="text-sm text-gray-500">{venue.category}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-gray-900">{venue.rating.toFixed(1)}</span>
          <span className="text-sm text-gray-500">({venue.reviewCount.toLocaleString()})</span>
        </div>
      </div>
    </Link>
  );
}
