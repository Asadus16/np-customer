'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronRight, Star } from 'lucide-react';
import Image from 'next/image';

interface Review {
  id: string;
  title: string;
  text: string;
  rating: number;
  reviewerName: string;
  reviewerLocation: string;
  avatar?: string;
}

// Static reviews data
const staticReviews: Review[] = [
  {
    id: 'review-1',
    title: 'The best booking system',
    text: 'Great experience, easy to book. Paying for treatments is so convenient — no cash or cards needed!',
    rating: 5.0,
    reviewerName: 'Lucy',
    reviewerLocation: 'London, UK',
    avatar: '/1.jpg', // Using existing images for avatars
  },
  {
    id: 'review-2',
    title: 'Easy to use & explore',
    text: "Fresha's reminders make life so much easier. I also found a few good barbershops that I didn't know existed.",
    rating: 5.0,
    reviewerName: 'Dan',
    reviewerLocation: 'New York, USA',
    avatar: '/2.jpg',
  },
  {
    id: 'review-3',
    title: 'Great for finding barbers',
    text: "I've been using Fresha for two years and it's by far the best booking platform I've used. Highly recommend it!",
    rating: 5.0,
    reviewerName: 'Dale',
    reviewerLocation: 'Sydney, Australia',
    avatar: '/3.jpg',
  },
  {
    id: 'review-4',
    title: 'My go-to for self-care',
    text: 'Fresha is my go-to app for massages and facials. I can easily find and book places near me — I love it!',
    rating: 5.0,
    reviewerName: 'Cameron',
    reviewerLocation: 'Edinburgh, UK',
    avatar: '/4.jpg',
  },
];

export function ReviewsSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setScrollPosition(scrollLeft);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, [checkScrollPosition]);

  const handleScroll = useCallback((direction: 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 400;
    const newPosition = scrollPosition + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth',
    });
  }, [scrollPosition]);

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
        </div>

        {/* Scrollable Container */}
        <div className="relative">
          {/* Review Cards */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollPosition}
            className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth pb-2"
          >
            {staticReviews.map((review) => (
              <div
                key={review.id}
                className="flex-shrink-0 w-80 bg-gray-50 rounded-xl p-6 border border-gray-200"
              >
                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {review.title}
                </h3>

                {/* Review Text */}
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  {review.text}
                </p>

                {/* Reviewer Info */}
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {review.avatar ? (
                      <Image
                        src={review.avatar}
                        alt={review.reviewerName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <span className="text-gray-600 font-medium text-sm">
                          {review.reviewerName.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {review.reviewerName}
                    </p>
                    <p className="text-xs text-gray-600">
                      {review.reviewerLocation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Scroll Button */}
          {canScrollRight && (
            <button
              onClick={() => handleScroll('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center"
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
