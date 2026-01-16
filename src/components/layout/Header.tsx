'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, MapPin, Calendar } from 'lucide-react';
import { ROUTES } from '@/config';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isVendorPage = pathname?.startsWith('/vendor');

  return (
    <header className="bg-white sticky top-0 z-50">
      <div className="px-8 lg:px-12">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center shrink-0">
            <span className="text-2xl font-bold text-gray-900 lowercase">fresha</span>
          </Link>

          {/* Search Bar - Desktop (only on vendor pages) */}
          {isVendorPage && (
            <div className="hidden md:flex flex-1 justify-center">
              <div className="flex items-center border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow">
                {/* All treatments */}
                <button className="flex items-center gap-2 px-5 py-2.5 border-r border-gray-200 hover:bg-gray-50 rounded-l-full transition-colors">
                  <Search className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">All treatments</span>
                </button>

                {/* Location */}
                <button className="flex items-center gap-2 px-5 py-2.5 border-r border-gray-200 hover:bg-gray-50 transition-colors">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Current location</span>
                </button>

                {/* Time */}
                <button className="flex items-center gap-2 px-5 py-2.5 hover:bg-gray-50 rounded-r-full transition-colors">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Any time</span>
                </button>
              </div>
            </div>
          )}

          {/* Spacer for non-vendor pages */}
          {!isVendorPage && <div className="flex-1" />}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center shrink-0">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full hover:shadow-md transition-all text-sm font-medium">
              Menu
              <Menu className="h-4 w-4" />
            </button>
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
