'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, ArrowRight, Globe } from 'lucide-react';
import { ROUTES } from '@/config';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isVendorPage = pathname?.startsWith('/vendor');

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

  return (
    <header className="bg-white sticky top-0 z-50">
      <div className="px-8 lg:px-12">
        <div className="flex items-center h-20 gap-6">
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
          <nav className="hidden md:flex items-center shrink-0 relative" ref={desktopMenuRef}>
            <button
              onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full hover:shadow-md transition-all text-[15px] font-medium"
            >
              Menu
              <Menu className="h-4 w-4" />
            </button>

            {/* Desktop Dropdown Menu */}
            {isDesktopMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-4 z-50" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 12px 24px -8px rgba(0, 0, 0, 0.15)' }}>
                <div className="px-5 py-2">
                  <p className="text-base font-semibold text-gray-900">For customers</p>
                </div>
                <Link
                  href={ROUTES.LOGIN}
                  onClick={() => setIsDesktopMenuOpen(false)}
                  className="block px-5 py-3 text-indigo-600 hover:bg-gray-50 transition-colors"
                >
                  Log in or sign up
                </Link>
                <button className="w-full px-5 py-3 text-gray-900 hover:bg-gray-50 transition-colors text-left">
                  Download the app
                </button>
                <button className="w-full px-5 py-3 text-gray-900 hover:bg-gray-50 transition-colors text-left">
                  Help and support
                </button>
                <button className="w-full px-5 py-3 text-gray-900 hover:bg-gray-50 transition-colors text-left flex items-center gap-3">
                  <Globe className="h-5 w-5" />
                  English
                </button>
                <div className="my-2 border-t border-gray-200 mx-5" />
                <Link
                  href="#"
                  onClick={() => setIsDesktopMenuOpen(false)}
                  className="flex items-center justify-between px-5 py-3 text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  For businesses
                  <ArrowRight className="h-5 w-5" />
                </Link>
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
              <p className="px-4 py-2 text-sm font-semibold text-gray-900">For customers</p>
              <Link
                href={ROUTES.LOGIN}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 text-indigo-600 hover:bg-gray-100 rounded-lg"
              >
                Log in or sign up
              </Link>
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
