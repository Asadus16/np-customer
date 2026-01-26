'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2 } from 'lucide-react';
import { FavoriteButton } from './FavoriteButton';

type NavSection = 'photos' | 'services' | 'team' | 'reviews' | 'about';

const navItems: { id: NavSection; label: string }[] = [
  { id: 'photos', label: 'Photos' },
  { id: 'services', label: 'Services' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'about', label: 'About' },
];

interface VendorNavBarProps {
  vendorName?: string;
  isFavorite?: boolean;
  isLoading?: boolean;
  onToggleFavorite?: () => Promise<boolean>;
}

export function VendorNavBar({ vendorName = '', isFavorite = false, isLoading = false, onToggleFavorite }: VendorNavBarProps) {
  const router = useRouter();
  const [showNav, setShowNav] = useState(false);
  const [activeSection, setActiveSection] = useState<NavSection>('photos');
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({});

  useEffect(() => {
    // Use hysteresis to prevent jitter - different thresholds for show/hide
    // Lower threshold for mobile
    const SHOW_THRESHOLD = window.innerWidth < 768 ? 200 : 400;
    const HIDE_THRESHOLD = window.innerWidth < 768 ? 150 : 350;

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

  // Update indicator position when active section changes
  useEffect(() => {
    const activeTab = tabRefs.current[activeSection];
    if (activeTab) {
      const parentRect = activeTab.parentElement?.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      if (parentRect) {
        setIndicatorStyle({
          left: tabRect.left - parentRect.left,
          width: tabRect.width,
        });
      }
    }
  }, [activeSection, showNav]);

  const scrollToSection = (sectionId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      const offset = window.innerWidth < 768 ? 110 : 56; // Account for navbar height (taller on mobile)
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div
      className={`w-full bg-white fixed top-0 left-0 right-0 z-[60] border-b border-gray-200 transition-transform duration-300 ease-out ${
        showNav ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3">
        <button
          onClick={handleBack}
          className="h-10 w-10 flex items-center justify-center -ml-2"
        >
          <ArrowLeft className="h-5 w-5 text-gray-900" />
        </button>

        <h1 className="flex-1 text-center font-semibold text-gray-900 truncate px-2">
          {vendorName}
        </h1>

        <div className="flex items-center gap-1">
          <button className="h-10 w-10 flex items-center justify-center">
            <Share2 className="h-5 w-5 text-gray-700" />
          </button>
{onToggleFavorite && (
            <FavoriteButton
              isFavorite={isFavorite}
              isLoading={isLoading}
              onToggle={onToggleFavorite}
              size="sm"
              className="border-0"
            />
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="h-12 md:h-14 px-4 md:px-8 lg:px-12 w-full flex items-center overflow-x-auto hide-scrollbar">
        <div className="h-full flex items-center gap-5 md:gap-6 relative">
          {navItems.map((item) => (
            <a
              key={item.id}
              ref={(el) => { tabRefs.current[item.id] = el; }}
              href={`#${item.id}`}
              onClick={scrollToSection(item.id)}
              className={`text-sm font-medium h-full flex items-center transition-colors duration-300 whitespace-nowrap ${
                activeSection === item.id
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {item.label}
            </a>
          ))}
          {/* Sliding indicator */}
          <div
            className="absolute bottom-0 h-0.5 bg-gray-900 transition-all duration-300 ease-out"
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
          />
        </div>
      </nav>
    </div>
  );
}
