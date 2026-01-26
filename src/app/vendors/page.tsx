'use client';

import { useState, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { useVendorSearch } from '@/hooks/useVendorSearch';
import { VendorListCard, VendorListCardSkeleton } from '@/components/vendors/VendorListCard';
import { VendorFiltersDrawer } from '@/components/vendors/VendorFiltersDrawer';
import { VendorSearchMap } from '@/components/map';

function VendorsPageContent() {
  const router = useRouter();
  const [isMapVisible, setIsMapVisible] = useState(true);
  const [hoveredVendorId, setHoveredVendorId] = useState<string | null>(null);
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  const {
    vendors,
    isLoading,
    error,
    meta,
    filters,
    setSort,
    clearFilters,
  } = useVendorSearch();

  // Scroll to vendor when marker is clicked
  const scrollToVendor = useCallback((vendorId: string) => {
    const element = document.getElementById(`vendor-${vendorId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHoveredVendorId(vendorId);
      setTimeout(() => setHoveredVendorId(null), 2000);
    }
  }, []);

  // Map vendors for the map component
  const mapVendors = vendors.map(v => ({
    id: v.id,
    name: v.name,
    latitude: (v as any).latitude,
    longitude: (v as any).longitude,
    rating: (v as any).rating || 5.0,
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="flex h-screen">
        {/* Vendor List */}
        <div className={`${isMapVisible ? 'w-full lg:w-[58%]' : 'w-full'} overflow-y-auto bg-white`}>
          <div className="p-4 lg:py-6 lg:pl-10 lg:pr-6">
            {/* Controls Row */}
            <div className="flex items-center justify-between gap-3 mb-6">
              {/* Venues Count */}
              <span
                className="font-roobert"
                style={{
                  fontSize: '15px',
                  fontWeight: 'normal',
                  lineHeight: '20px',
                  color: 'rgb(118, 118, 118)'
                }}
              >
                {meta?.total || 0} venues within map area
              </span>

              {/* Buttons */}
              <div className="flex items-center gap-3">
                {/* Filters Button */}
                <button
                  onClick={() => setShowFiltersDrawer(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300 hover:border-gray-400 text-sm font-medium bg-white"
                >
                  <Image
                    src="/mapPage/filter.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="opacity-80"
                  />
                  <span>Filters</span>
                </button>

                {/* Map Toggle */}
                <button
                  onClick={() => setIsMapVisible(!isMapVisible)}
                  className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300 hover:border-gray-400 text-sm font-medium bg-white"
                >
                  <Image
                    src="/mapPage/map.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="opacity-80"
                  />
                  <span>{isMapVisible ? 'Hide map' : 'Show map'}</span>
                </button>
              </div>
            </div>

            {/* Vendor Cards - Grid Layout */}
            <div className={`grid grid-cols-1 md:grid-cols-2 ${!isMapVisible ? 'lg:grid-cols-3 xl:grid-cols-4' : ''} gap-x-8 gap-y-6`}>
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, i) => (
                  <VendorListCardSkeleton key={i} />
                ))
              ) : error ? (
                // Error state
                <div className="text-center py-12">
                  <p className="text-red-500 mb-2">Failed to load vendors</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-sm text-purple-600 hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : vendors.length === 0 ? (
                // Empty state - Fresha style
                <div className="col-span-full flex flex-col items-center justify-center py-20">
                  <div className="mb-6 text-purple-600">
                    <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="48" height="48">
                      <path fillRule="evenodd" d="M14.5 5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19M3 14.5C3 8.149 8.149 3 14.5 3S26 8.149 26 14.5c0 2.816-1.012 5.395-2.692 7.394l5.4 5.399a1 1 0 0 1-1.415 1.414l-5.399-5.399c-2 1.68-4.578 2.692-7.394 2.692C8.149 26 3 20.851 3 14.5" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    No results to display
                  </h2>
                  <p className="text-gray-500 text-base">
                    Try adjusting your search area
                  </p>
                </div>
              ) : (
                // Vendor list
                vendors.map((vendor) => (
                  <VendorListCard
                    key={vendor.id}
                    vendor={vendor}
                    isHighlighted={hoveredVendorId === vendor.id}
                    onMouseEnter={() => setHoveredVendorId(vendor.id)}
                    onMouseLeave={() => setHoveredVendorId(null)}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {Array.from({ length: Math.min(meta.last_page, 5) }).map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => {
                        const params = new URLSearchParams(window.location.search);
                        params.set('page', String(page));
                        router.push(`/vendors?${params.toString()}`);
                      }}
                      className={`w-10 h-10 rounded-full text-sm font-medium ${
                        filters.page === page
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        {isMapVisible && (
          <div className="hidden lg:block w-[42%] sticky top-0 pt-6 h-[calc(100vh-80px)] pl-0 pr-6 pb-6">
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-sm border border-gray-200">
              <VendorSearchMap
                vendors={mapVendors}
                hoveredVendorId={hoveredVendorId}
                onMarkerHover={setHoveredVendorId}
                onMarkerClick={scrollToVendor}
              />
            </div>
          </div>
        )}
      </div>

      {/* Filters Drawer */}
      <VendorFiltersDrawer
        isOpen={showFiltersDrawer}
        onClose={() => setShowFiltersDrawer(false)}
        filters={filters}
        onSortChange={setSort}
        onClearFilters={clearFilters}
      />
    </div>
  );
}

export default function VendorsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    }>
      <VendorsPageContent />
    </Suspense>
  );
}
