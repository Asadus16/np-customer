'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ShoppingCart, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks';
import { getUserInitials } from '@/types';
import { ROUTES } from '@/config';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center">
            <span className="text-xl font-bold text-gray-900">NP Customer</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href={ROUTES.VENDORS}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Vendors
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href={ROUTES.ORDERS}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  My Orders
                </Link>
                <Link
                  href={ROUTES.SUBSCRIPTIONS}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Subscriptions
                </Link>
              </>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Cart */}
                <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                  <ShoppingCart className="h-5 w-5 text-gray-600" />
                </button>

                {/* Notifications */}
                <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                  <Bell className="h-5 w-5 text-gray-600" />
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2"
                  >
                    <div className="h-8 w-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {getUserInitials(user)}
                      </span>
                    </div>
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">
                            {user?.first_name} {user?.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <Link
                          href={ROUTES.PROFILE}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <User className="h-4 w-4 mr-3 text-gray-400" />
                          Profile
                        </Link>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut className="h-4 w-4 mr-3 text-gray-400" />
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href={ROUTES.LOGIN}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href={ROUTES.REGISTER}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
                >
                  Sign up
                </Link>
              </div>
            )}

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
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2">
              <Link
                href={ROUTES.VENDORS}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Vendors
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    href={ROUTES.ORDERS}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    My Orders
                  </Link>
                  <Link
                    href={ROUTES.SUBSCRIPTIONS}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Subscriptions
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
