'use client';

import { useMemo } from 'react';
import {
  HeroSection,
  HomePageLayout,
  VendorSection,
  VendorCard,
  VendorCardData,
  BookAgainSection,
  AppDownloadSection,
  ReviewsSection,
  StatsSection,
  BusinessSection,
  BrowseByCitySection,
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
    <HomePageLayout backgroundClassName="bg-gradient-to-br from-white via-[#fef9f6] to-[#faf8ff]">
      {/* Wrapper for Hero, New to Platform, and Recommended sections with shared animation */}
      <div className="relative overflow-x-hidden !overflow-y-hidden w-full">
        {/* Single Orbital Container for both SVGs - spans across all three sections */}
        <div 
          className="absolute pointer-events-none"
          style={{
            top: '50%',
            left: '50%',
            width: '1500px',
            height: '1500px',
            marginTop: '-750px',
            marginLeft: '-750px',
            transformOrigin: 'center center',
            animation: 'orbit-clockwise 30s linear infinite',
            zIndex: 0,
          }}
        >
          {/* Pink SVG - positioned at top */}
          <div
            style={{
              backgroundImage: 'url(/bg-pink.svg)',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: 'contain',
              width: '1200px',
              height: '1000px',
              position: 'absolute',
              top: '0',
              left: '50%',
              marginLeft: '-450px',
              transformOrigin: 'center center',
              animation: 'rotate-self 20s linear infinite',
              opacity: 0.4,
            }}
          />
          {/* Purple SVG - positioned at bottom (180 degrees opposite) */}
          <div
            style={{
              backgroundImage: 'url(/bg-purple.svg)',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: 'contain',
              width: '1200px',
              height: '1000px',
              position: 'absolute',
              bottom: '0',
              left: '50%',
              marginLeft: '-450px',
              transformOrigin: 'center center',
              animation: 'rotate-self 25s linear infinite',
              opacity: 0.4,
            }}
          />
        </div>
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes orbit-clockwise {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
            @keyframes rotate-self {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `
        }} />
        
        {/* Hero Section */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <HeroSection />
        </div>

        {/* Book Again Section - Shows past orders for logged in users */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <BookAgainSection />
        </div>

        {/* Main Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
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

          {/* New to Platform Section - Dynamic */}
          <VendorSection
            title="New to Platform"
            vendors={newToFreshaVendors}
            isLoading={isLoading}
          />

          {/* Recommended Section - Dynamic */}
          <VendorSection
            title="Recommended"
            vendors={recommendedVendors}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Sections below the animation area */}
      <div>
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

        {/* Browse by City Section */}
        <BrowseByCitySection />
      </div>
    </HomePageLayout>
  );
}
