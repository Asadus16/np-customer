'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/config';
import { getUserFullName } from '@/types';

export function Header() {
  const { isAuthenticated, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center">
            <span className="text-2xl font-bold text-gray-900 lowercase">fresha</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              Send a gift card
            </Link>
            {isAuthenticated && user ? (
              <Link
                href={ROUTES.PROFILE}
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                {getUserFullName(user)}
              </Link>
            ) : (
              <Link
                href={ROUTES.LOGIN}
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                Log in
              </Link>
            )}
            <Link
              href="#"
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              List your business
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
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
            <nav className="flex flex-col space-y-2">
              <Link
                href="#"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Send a gift card
              </Link>
              {isAuthenticated && user ? (
                <Link
                  href={ROUTES.PROFILE}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                >
                  {getUserFullName(user)}
                </Link>
              ) : (
                <Link
                  href={ROUTES.LOGIN}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Log in
                </Link>
              )}
              <Link
                href="#"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                List your business
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
