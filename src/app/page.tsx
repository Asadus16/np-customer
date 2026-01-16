'use client';

import { useMemo } from 'react';
import {
  HeroSection,
  VendorSection,
  VendorCardData,
  AppDownloadSection,
  ReviewsSection,
  StatsSection,
  BusinessSection,
} from '@/components/home';
import { useVendors } from '@/hooks';

// Static recommended vendors data
const staticRecommendedVendors: VendorCardData[] = [
  {
    id: 'static-1',
    name: "Rooster's Barbershop",
    logo: null,
    images: ['/1.jpg'],
    category: 'Barber',
    rating: 5.0,
    reviewCount: 8789,
    location: 'Ampelokipoi',
    startingPrice: 0,
    isVerified: true,
  },
  {
    id: 'static-2',
    name: 'Hair by Common Studio - Queenstown',
    logo: null,
    images: ['/2.jpg'],
    category: 'Hair Salon',
    rating: 4.9,
    reviewCount: 1419,
    location: 'Queenstown, Singapore',
    startingPrice: 0,
    isVerified: true,
  },
  {
    id: 'static-3',
    name: "Padioi Men's Grooming",
    logo: null,
    images: ['/3.jpg'],
    category: 'Barber',
    rating: 5.0,
    reviewCount: 1059,
    location: "PADIOI Men's Grooming, Prince Sultan Bin Fah...",
    startingPrice: 0,
    isVerified: true,
  },
  {
    id: 'static-4',
    name: 'Luxio Nail Ladies Salon',
    logo: null,
    images: ['/4.jpg'],
    category: 'Nails',
    rating: 5.0,
    reviewCount: 779,
    location: 'Arenco Tower, Shop 8 Exit 33, Dubai Media Cit...',
    startingPrice: 0,
    isVerified: true,
  },
];

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

        {/* New to Platform Section - Dynamic (on top) */}
        <VendorSection
          title="New to Platform"
          vendors={newToFreshaVendors}
          isLoading={isLoading}
        />

        {/* Static Recommended Section */}
        <VendorSection
          title="Recommended"
          vendors={staticRecommendedVendors}
          isLoading={false}
        />

        {/* Dynamic Top Rated Section (if needed) */}
        {recommendedVendors.length > 0 && (
          <VendorSection
            title="Top Rated"
            vendors={recommendedVendors}
            isLoading={isLoading}
          />
        )}

        {/* App Download Section */}
        <AppDownloadSection />

        {/* Reviews Section */}
        <ReviewsSection />

        {/* Stats Section */}
        <StatsSection />

        {/* Business Section */}
        <BusinessSection />
      </main>
    </div>
  );
}
