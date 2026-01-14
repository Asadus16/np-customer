'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Home, Wrench, Zap, Wind, Scissors, Car, ShoppingBag, Utensils, Dumbbell, PaintBucket, Leaf, Dog, Camera, Music } from 'lucide-react';

// Category data with icons
const CATEGORIES = [
  { id: 'all', name: 'All', icon: Sparkles },
  { id: 'cleaning', name: 'Cleaning', icon: Home },
  { id: 'plumbing', name: 'Plumbing', icon: Wrench },
  { id: 'electrical', name: 'Electrical', icon: Zap },
  { id: 'ac-repair', name: 'AC Repair', icon: Wind },
  { id: 'beauty', name: 'Beauty', icon: Scissors },
  { id: 'automotive', name: 'Automotive', icon: Car },
  { id: 'shopping', name: 'Shopping', icon: ShoppingBag },
  { id: 'catering', name: 'Catering', icon: Utensils },
  { id: 'fitness', name: 'Fitness', icon: Dumbbell },
  { id: 'painting', name: 'Painting', icon: PaintBucket },
  { id: 'gardening', name: 'Gardening', icon: Leaf },
  { id: 'pet-care', name: 'Pet Care', icon: Dog },
  { id: 'photography', name: 'Photography', icon: Camera },
  { id: 'events', name: 'Events', icon: Music },
];

interface CategoryTabsProps {
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoryTabs({ selectedCategory, onCategoryChange }: CategoryTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  // Initial check and on resize
  useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, [checkScrollPosition]);

  // Scroll handler
  const handleScroll = useCallback((direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 200;
    const newPosition = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth',
    });
  }, []);

  return (
    <div className="sticky top-16 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center py-4">
          {/* Left Scroll Button */}
          {canScrollLeft && (
            <>
              <div className="absolute left-0 w-12 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
              <button
                onClick={() => handleScroll('left')}
                className="absolute left-0 z-20 h-8 w-8 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-shadow"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
            </>
          )}

          {/* Categories Container */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollPosition}
            className="flex items-center gap-8 overflow-x-auto hide-scrollbar scroll-smooth px-2"
          >
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`flex flex-col items-center gap-2 py-2 px-1 min-w-fit border-b-2 transition-all ${
                    isSelected
                      ? 'border-gray-900 opacity-100'
                      : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isSelected ? 'text-gray-900' : 'text-gray-600'}`} />
                  <span className={`text-xs font-medium whitespace-nowrap ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Scroll Button */}
          {canScrollRight && (
            <>
              <div className="absolute right-0 w-12 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
              <button
                onClick={() => handleScroll('right')}
                className="absolute right-0 z-20 h-8 w-8 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-shadow"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Export categories for use elsewhere
export { CATEGORIES };
