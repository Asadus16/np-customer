'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Globe, ArrowRight, X, ChevronRight } from 'lucide-react';
import { ROUTES } from '@/config';
import { useAuth } from '@/hooks';
import { UserProfileDropdown } from './UserProfileDropdown';
import { SearchBar } from './SearchBar';

export function Header() {
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isVendorPage = pathname?.startsWith('/vendor');
  const isProfilePage = pathname === '/profile' || pathname === '/appointments' || pathname === '/wallet' || pathname === '/favorites' || pathname === '/forms' || pathname === '/orders' || pathname === '/settings';
  const showSearchBar = isVendorPage || isProfilePage;
  const { user, isAuthenticated } = useAuth();

  // Close desktop menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(event.target as Node)) {
        setIsDesktopMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle mobile menu open with slide-up animation
  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
    // Small delay to allow DOM to render before animating
    requestAnimationFrame(() => {
      setIsMobileMenuVisible(true);
    });
  };

  // Handle mobile menu close with slide-down animation
  const closeMobileMenu = () => {
    setIsMobileMenuVisible(false);
    // Wait for animation to complete before removing from DOM
    setTimeout(() => {
      setIsMobileMenuOpen(false);
    }, 300);
  };


  // Get user initials for mobile profile avatar
  const getUserInitials = () => {
    if (user?.first_name || user?.last_name) {
      const first = user.first_name?.[0] || '';
      const last = user.last_name?.[0] || '';
      return `${first}${last}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Handle scroll to change background from transparent to white
  useEffect(() => {
    function handleScroll() {
      // Get scroll position
      const scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      // At top (≤10px) = transparent, when scrolled (>10px) = white background
      setIsScrolled(scrollPosition > 10);
    }

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Check initial position after mount
    requestAnimationFrame(() => {
      handleScroll();
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={`${isVendorPage ? 'relative hidden md:block' : 'sticky top-0'} z-50 transition-all duration-300 ${
        isScrolled && !isVendorPage ? 'bg-white shadow-sm' : isVendorPage ? 'bg-white' : 'bg-transparent'
      } ${isProfilePage ? 'border-b border-gray-200' : ''}`}
    >
      <div className="max-w-[90rem] mx-auto px-1 sm:px-3 lg:px-4">
        <div className={`flex items-center gap-6 transition-all duration-300 ${isSearchExpanded ? 'py-3' : 'py-2'}`}>
          {/* Logo */}
          <Link href={ROUTES.HOME} className={`flex items-center shrink-0 ${isProfilePage ? '-ml-3 lg:-ml-5 mr-3 lg:mr-5' : ''}`}>
            <Image
              src="/logos/Logo.svg"
              alt="No Problem"
              width={220}
              height={64}
              className="h-14 w-auto"
              priority
            />
          </Link>

          {/* Search Bar - Desktop */}
          {showSearchBar && (
            <div className="hidden md:flex flex-1 justify-start ml-37">
              <SearchBar className="w-[720px]" onExpandChange={setIsSearchExpanded} />
            </div>
          )}

          {/* Spacer for pages without search bar */}
          {!showSearchBar && <div className="flex-1" />}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <UserProfileDropdown />
            ) : (
              <div className="relative" ref={desktopMenuRef}>
                <button
                  onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
                  className="flex items-center gap-2 px-5 py-2.5 border border-[#d3d3d3] rounded-full hover:shadow-md transition-all text-base font-semibold"
                >
                  Menu
                  <Menu className="h-5 w-5" />
                </button>

                {/* Desktop Dropdown Menu */}
                {isDesktopMenuOpen && (
                  <div
                    className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl border border-gray-100 py-2 z-50"
                    style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 12px 24px -8px rgba(0, 0, 0, 0.15)' }}
                  >
                    <div className="px-4 py-1.5">
                      <p className="text-sm font-semibold text-gray-900">For customers</p>
                    </div>
                    <Link
                      href={ROUTES.LOGIN}
                      onClick={() => setIsDesktopMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-indigo-600 hover:bg-gray-50 transition-colors"
                    >
                      Log in or sign up
                    </Link>
                    <button className="w-full px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 transition-colors text-left">
                      Download the app
                    </button>
                    <button className="w-full px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 transition-colors text-left">
                      Help and support
                    </button>
                    <button className="w-full px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 transition-colors text-left flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      English
                    </button>
                    <div className="my-1.5 border-t border-gray-200 mx-4" />
                    <Link
                      href="#"
                      onClick={() => setIsDesktopMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      For businesses
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Mobile menu - Profile avatar (logged in) or burger menu (logged out) */}
          {isAuthenticated ? (
            <Link
              href="/menu"
              className="md:hidden shrink-0 mr-2 flex items-center"
            >
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xs">
                {getUserInitials()}
              </div>
            </Link>
          ) : (
            <button
              onClick={openMobileMenu}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg shrink-0 mr-2 flex items-center justify-center"
            >
              <Menu className="h-7 w-9 text-gray-900" />
            </button>
          )}
        </div>
      </div>

      {/* Full-screen Mobile Menu for logged out users */}
      {isMobileMenuOpen && !isAuthenticated && (
        <div className="md:hidden fixed inset-0 z-[100]">
          {/* Sliding Panel - Full Screen */}
          <div
            className={`absolute inset-0 bg-gray-100 transition-transform duration-300 ease-out ${
              isMobileMenuVisible ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            {/* Header with close button */}
            <div className="flex justify-end px-4 py-4">
              <button
                onClick={closeMobileMenu}
                className="p-2"
              >
                <X className="h-6 w-6 text-gray-900" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 pt-4 pb-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 72px)' }}>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">For customers</h1>

              {/* Main Menu Card */}
              <div className="bg-white rounded-2xl overflow-hidden mb-4 border border-gray-200 pt-2">
                <Link
                  href={ROUTES.LOGIN}
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-indigo-600 font-medium">Log in or sign up</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
                <button className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <span className="text-gray-900 font-medium">Download the app</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <span className="text-gray-900 font-medium">Help and support</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-900 font-medium">English</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* For Businesses Card */}
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
                <Link
                  href="#"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between px-5 py-5 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-900 font-medium">For businesses</span>
                  <ArrowRight className="h-5 w-5 text-gray-600" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
