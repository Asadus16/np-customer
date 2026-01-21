'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Search, Globe, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/config';
import { useAuth } from '@/hooks';
import { UserProfileDropdown } from './UserProfileDropdown';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isVendorPage = pathname?.startsWith('/vendor');
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

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
      className={`sticky top-0 z-50 transition-colors duration-300   ${
        isScrolled ? 'bg-white' : 'bg-transparent'
      } ${isScrolled ? 'h-[72px]' : 'h-[0px]'}`}
    >
      <div className="max-w-[90rem] mx-auto px-1 sm:px-3 lg:px-4">
        <div className="flex items-center h-[72px] gap-6">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center shrink-0">
            <Image
              src="/logos/Logo.svg"
              alt="No Problem"
              width={220}
              height={64}
              className="h-16 w-auto"
              priority
            />
          </Link>

          {/* Search Bar - Desktop (only on vendor pages) */}
          {isVendorPage && (
            <div className="hidden md:flex flex-1 justify-center">
              <div className="flex items-center border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-shadow w-[700px]">
                {/* All treatments */}
                <button className="flex-1 flex items-center justify-center gap-3 py-4 hover:bg-gray-50 rounded-l-full transition-colors">
                  <Search className="h-4 w-4 text-gray-400" />
                  <span className="text-[15px] font-medium leading-[15px] text-[rgb(20,20,20)]">All treatments</span>
                </button>

                {/* Divider */}
                <div className="h-7 w-px bg-gray-200" />

                {/* Location */}
                <button className="flex-1 flex items-center justify-center gap-3 py-4 hover:bg-gray-50 transition-colors">
                  <span className="text-[15px] font-medium leading-[15px] text-gray-500">Current location</span>
                </button>

                {/* Divider */}
                <div className="h-7 w-px bg-gray-200" />

                {/* Time */}
                <button className="flex-1 flex items-center justify-center gap-3 py-4 hover:bg-gray-50 rounded-r-full transition-colors">
                  <span className="text-[15px] font-medium leading-[15px] text-gray-500">Any time</span>
                </button>
              </div>
            </div>
          )}

          {/* Spacer for non-vendor pages */}
          {!isVendorPage && <div className="flex-1" />}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <UserProfileDropdown />
            ) : (
              <div className="relative" ref={desktopMenuRef}>
                <button
                  onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full hover:shadow-md transition-all text-sm font-medium"
                >
                  Menu
                  <Menu className="h-4 w-4" />
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

          {/* Mobile Search Button */}
          <button className="md:hidden flex items-center gap-2 flex-1 mx-2 px-4 py-2 border border-gray-200 rounded-full shadow-sm">
            <Search className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">Search...</span>
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg shrink-0"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-gray-600" />
            ) : (
              <Menu className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col">
              {isAuthenticated ? (
                <>
                  <p className="px-4 py-2 text-sm font-semibold text-gray-900">Account</p>
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-lg text-left"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/appointments"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-lg text-left"
                  >
                    Appointments
                  </Link>
                  <Link
                    href="/wallet"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-lg text-left"
                  >
                    Wallet
                  </Link>
                  <Link
                    href="/favorites"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-lg text-left"
                  >
                    Favorites
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-lg text-left"
                  >
                    Product orders
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-lg text-left"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={async () => {
                      await logout();
                      setIsMobileMenuOpen(false);
                      router.push(ROUTES.HOME);
                    }}
                    className="px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-lg text-left"
                  >
                    Log out
                  </button>
                  <div className="my-2 border-t border-gray-200" />
                </>
              ) : (
                <>
                  <p className="px-4 py-2 text-sm font-semibold text-gray-900">For customers</p>
                  <Link
                    href={ROUTES.LOGIN}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 text-indigo-600 hover:bg-gray-100 rounded-lg"
                  >
                    Log in or sign up
                  </Link>
                </>
              )}
              <button className="px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-lg text-left">
                Download the app
              </button>
              <button className="px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-lg text-left">
                Help and support
              </button>
              <button className="px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-lg text-left flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                English
              </button>
              <div className="my-2 border-t border-gray-200" />
              <Link
                href="#"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-lg flex items-center justify-between"
              >
                For businesses
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
