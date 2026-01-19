'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ServiceTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function ServiceTabs({
  categories,
  activeCategory,
  onCategoryChange,
}: ServiceTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 0);
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

    const scrollAmount = 200;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative flex items-center" id="services">
      {/* Tabs Container */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-6 overflow-x-auto hide-scrollbar flex-1"
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`whitespace-nowrap transition-colors ${
              activeCategory === category
                ? 'px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-semibold'
                : 'text-gray-600 hover:text-gray-900 text-sm font-semibold'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Navigation Arrows */}
      <div className="flex items-center gap-1 ml-4 shrink-0">
        <button
          onClick={() => scroll('left')}
          disabled={!showLeftArrow}
          className={`p-1 transition-colors ${
            showLeftArrow ? 'text-gray-600 hover:text-gray-900' : 'text-gray-300'
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scroll('right')}
          disabled={!showRightArrow}
          className={`p-1 transition-colors ${
            showRightArrow ? 'text-gray-600 hover:text-gray-900' : 'text-gray-300'
          }`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
