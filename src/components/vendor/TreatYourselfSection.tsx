'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ServiceLink {
  name: string;
  href: string;
}

interface TreatYourselfSectionProps {
  location: string;
  serviceLinks: ServiceLink[];
  nearbyServiceLinks?: ServiceLink[];
}

export function TreatYourselfSection({
  location,
  serviceLinks,
  nearbyServiceLinks,
}: TreatYourselfSectionProps) {
  const [activeTab, setActiveTab] = useState<'in' | 'around'>('in');
  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPage = 30; // 5 columns x 6 rows
  const links = activeTab === 'in' ? serviceLinks : (nearbyServiceLinks || serviceLinks);
  const totalPages = Math.ceil(links.length / itemsPerPage);
  const currentLinks = links.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const canGoBack = currentPage > 0;
  const canGoForward = currentPage < totalPages - 1;

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Treat yourself anytime, anywhere
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => {
            setActiveTab('in');
            setCurrentPage(0);
          }}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'in'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Other businesses in {location}
        </button>
        {nearbyServiceLinks && nearbyServiceLinks.length > 0 && (
          <button
            onClick={() => {
              setActiveTab('around');
              setCurrentPage(0);
            }}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'around'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Other businesses around {location}
          </button>
        )}
      </div>

      {/* Service Links Grid */}
      <div className="relative">
        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-3">
          {currentLinks.map((link, index) => (
            <Link
              key={`${link.name}-${index}`}
              href={link.href}
              className="text-gray-700 hover:text-gray-900 hover:underline text-sm py-1 truncate"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Navigation Arrows */}
        {totalPages > 1 && (
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={!canGoBack}
              className={`h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center transition-colors ${
                canGoBack
                  ? 'hover:bg-gray-50 text-gray-600'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={!canGoForward}
              className={`h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center transition-colors ${
                canGoForward
                  ? 'hover:bg-gray-50 text-gray-600'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
