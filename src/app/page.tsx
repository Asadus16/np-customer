'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Star, MapPin } from 'lucide-react';
import {
  HeroSection,
  VendorSection,
} from '@/components/home';
import { useVendors } from '@/hooks';

// Static Demo Vendor for showcase
const DEMO_VENDOR = {
  id: 'demo-vendor-001',
  name: 'Glamour Beauty Salon & Spa',
  image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
  rating: 4.8,
  reviewCount: 1247,
  location: 'Downtown Dubai',
  category: 'Beauty & Wellness',
};

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
        {/* Demo Vendor Section - Always visible */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Featured Venue</h2>
              <span className="text-xs bg-[#6950f3]/10 text-[#6950f3] px-3 py-1 rounded-full font-medium">
                Demo
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link
                href="/demo/vendor"
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="aspect-4/3 relative overflow-hidden">
                  <img
                    src={DEMO_VENDOR.image}
                    alt={DEMO_VENDOR.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full">
                      {DEMO_VENDOR.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#6950f3] transition-colors">
                    {DEMO_VENDOR.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-900">{DEMO_VENDOR.rating}</span>
                    <span className="text-sm text-gray-500">({DEMO_VENDOR.reviewCount.toLocaleString()})</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span>{DEMO_VENDOR.location}</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

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
