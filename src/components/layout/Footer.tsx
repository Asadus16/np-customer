'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/config';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#f2f2f2] mt-16">
      <div className="px-4 md:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & App Download */}
          <div className="col-span-2 md:col-span-1">
            <Link href={ROUTES.HOME} className="block">
              <Image
                src="/logos/Logo.svg"
                alt="No Problem"
                width={160}
                height={46}
                className="h-12 w-auto"
              />
            </Link>

            {/* App Download Button */}
            <button className="mt-6 flex items-center gap-3 px-5 py-3 bg-white border border-gray-300 rounded-full hover:shadow-md transition-all">
              <span className="text-sm font-medium text-gray-900">Get the app</span>
              <div className="flex items-center gap-2">
                {/* Apple Icon */}
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                {/* Google Play Icon */}
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
              </div>
            </button>
          </div>

          {/* About No Problem */}
          <div>
            <h3 className="text-[17px] font-semibold leading-6 text-[rgb(20,20,20)] mb-4">
              About No Problem
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-[15px] leading-5 text-[rgb(20,20,20)] hover:underline">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[15px] leading-5 text-[rgb(20,20,20)] hover:underline">
                  Help and support
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[15px] leading-5 text-[rgb(20,20,20)] hover:underline">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[15px] leading-5 text-[rgb(20,20,20)] hover:underline">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>

          {/* For business */}
          <div>
            <h3 className="text-[17px] font-semibold leading-6 text-[rgb(20,20,20)] mb-4">
              For business
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-[15px] leading-5 text-[rgb(20,20,20)] hover:underline">
                  For partners
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[15px] leading-5 text-[rgb(20,20,20)] hover:underline">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[15px] leading-5 text-[rgb(20,20,20)] hover:underline">
                  Support
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[15px] leading-5 text-[rgb(20,20,20)] hover:underline">
                  Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[17px] font-semibold leading-6 text-[rgb(20,20,20)] mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-[15px] leading-5 text-[rgb(20,20,20)] hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[15px] leading-5 text-[rgb(20,20,20)] hover:underline">
                  Terms of service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[15px] leading-5 text-[rgb(20,20,20)] hover:underline">
                  Terms of use
                </Link>
              </li>
            </ul>
          </div>

          {/* Find us on social */}
          <div>
            <h3 className="text-[17px] font-semibold leading-6 text-[rgb(20,20,20)] mb-4">
              Find us on social
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[15px] leading-5 text-[rgb(20,20,20)] hover:underline flex items-center gap-3"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[15px] leading-5 text-[rgb(20,20,20)] hover:underline flex items-center gap-3"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[15px] leading-5 text-[rgb(20,20,20)] hover:underline flex items-center gap-3"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                  Linkedin
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[15px] leading-5 text-[rgb(20,20,20)] hover:underline flex items-center gap-3"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* Trademark Section */}
      <div className="bg-white px-4 md:px-8 lg:px-12 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Language Selector */}
          <button className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            English
          </button>

          {/* Copyright */}
          <p className="text-sm text-gray-500">
            &copy; {currentYear} No Problem
          </p>
        </div>
      </div>
      </footer>
  );
}
