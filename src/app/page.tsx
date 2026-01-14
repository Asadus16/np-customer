'use client';

import { useMemo } from 'react';
import {
  HeroSection,
  VendorSection,
} from '@/components/home';
import { useVendors } from '@/hooks';

export default function HomePage() {
  // Fetch all vendors
  const { vendors, isLoading, error } = useVendors({
    perPage: 50, // Fetch more vendors to have enough for filtering
  });

  // Recommended vendors (top rated, sorted by rating)
  const recommendedVendors = useMemo(() => {
    return [...vendors]
      .filter((v) => v.rating >= 4.5) // Top rated vendors
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
  }, [vendors]);

  // New to platform (lower review count, recently added feel)
  const newToFreshaVendors = useMemo(() => {
    return [...vendors]
      .filter((v) => v.reviewCount < 50) // Newer vendors with fewer reviews
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 8);
  }, [vendors]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <main className="bg-white pb-16">
        {/* Show error message if there's an error and no vendors */}
        {error && vendors.length === 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-yellow-800">
                Unable to load vendors. Please try again later.
              </p>
            </div>
          </div>
        )}

        {/* Recommended Section */}
        <VendorSection
          title="Recommended"
          vendors={recommendedVendors}
          isLoading={isLoading}
        />

        {/* New to Platform Section */}
        <VendorSection
          title="New to Platform"
          vendors={newToFreshaVendors}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
