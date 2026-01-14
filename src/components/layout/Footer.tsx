'use client';

import Link from 'next/link';
import { ROUTES } from '@/config';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href={ROUTES.HOME} className="text-xl font-bold text-gray-900">
              NP Customer
            </Link>
            <p className="mt-4 text-gray-600 text-sm max-w-md">
              Book professional services from trusted vendors in your area.
              Easy scheduling, secure payments, and quality guaranteed.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href={ROUTES.VENDORS}
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Browse Vendors
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.ORDERS}
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.PROFILE}
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  My Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Support
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/help" className="text-gray-600 hover:text-gray-900 text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-gray-900 text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            &copy; {currentYear} NP Customer. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
