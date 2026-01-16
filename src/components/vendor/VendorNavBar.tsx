'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

interface VendorNavBarProps {
  vendorName: string;
  rating: number;
  reviewCount: number;
  onBookNow?: () => void;
}

type NavSection = 'photos' | 'services' | 'team' | 'reviews' | 'about';

const navItems: { id: NavSection; label: string }[] = [
  { id: 'photos', label: 'Photos' },
  { id: 'services', label: 'Services' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'about', label: 'About' },
];

export function VendorNavBar({
  vendorName,
  rating,
  reviewCount,
  onBookNow,
}: VendorNavBarProps) {
  const [showNav, setShowNav] = useState(false);
  const [activeSection, setActiveSection] = useState<NavSection>('photos');

  useEffect(() => {
    // Use hysteresis to prevent jitter - different thresholds for show/hide
    const SHOW_THRESHOLD = 400;
    const HIDE_THRESHOLD = 350;

    function handleScroll() {
      const scrollY = window.scrollY;

      if (scrollY > SHOW_THRESHOLD && !showNav) {
        setShowNav(true);
      } else if (scrollY < HIDE_THRESHOLD && showNav) {
        setShowNav(false);
      }

      // Update active section based on scroll position
      const sections = navItems.map((item) => {
        const element = document.getElementById(item.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          return { id: item.id, top: rect.top };
        }
        return { id: item.id, top: Infinity };
      });

      const currentSection = sections.find(
        (section) => section.top > -100 && section.top < 200
      );
      if (currentSection) {
        setActiveSection(currentSection.id as NavSection);
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showNav]);

  const scrollToSection = (sectionId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      const offset = 80; // Account for sticky navbar height
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div
      className={`w-full h-[72px] bg-white fixed top-0 left-0 right-0 z-50 flex items-center justify-center border-b border-gray-200 transition-transform duration-300 ease-out ${
        showNav ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <nav className="h-full max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
        {/* Navigation Tabs */}
        <div className="h-full flex items-center gap-6">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={scrollToSection(item.id)}
              className={`text-sm font-medium h-full flex items-center border-b-2 transition-colors ${
                activeSection === item.id
                  ? 'text-gray-900 border-gray-900'
                  : 'text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Right Side - Rating & Book Button */}
        <div className="h-full flex items-center gap-5">
          {/* Vendor Info - Shows when scrolled */}
          <div className="hidden lg:flex flex-col justify-center">
            <span className="text-sm font-semibold text-gray-900">
              {vendorName}
            </span>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-gray-900">{rating}</span>
              <span className="text-xs text-gray-500">({reviewCount})</span>
            </div>
          </div>

          {/* Book Now Button */}
          <button
            onClick={onBookNow}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Book now
          </button>
        </div>
      </nav>
    </div>
  );
}
