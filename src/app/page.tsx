'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Clock, MapPin, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config';
import {
  HeroSection,
  CategoryTabs,
  VendorSection,
  VendorCardData,
} from '@/components/home';

// Mock data for demonstration - will be replaced with API data
const MOCK_VENDORS: VendorCardData[] = [
  {
    id: '1',
    name: 'SparkleClean Services',
    logo: '/placeholder.jpg',
    images: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
      'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800',
    ],
    category: 'Home Cleaning',
    rating: 4.9,
    reviewCount: 128,
    location: 'Dubai Marina',
    startingPrice: 150,
    isVerified: true,
    isFeatured: true,
  },
  {
    id: '2',
    name: 'FixIt Pro Plumbing',
    logo: '/placeholder.jpg',
    images: [
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800',
    ],
    category: 'Plumbing',
    rating: 4.8,
    reviewCount: 95,
    location: 'Downtown Dubai',
    startingPrice: 200,
    isVerified: true,
  },
  {
    id: '3',
    name: 'Elite Electric',
    logo: '/placeholder.jpg',
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',
    ],
    category: 'Electrical',
    rating: 4.7,
    reviewCount: 82,
    location: 'JBR',
    startingPrice: 180,
    isVerified: true,
  },
  {
    id: '4',
    name: 'CoolBreeze AC',
    logo: '/placeholder.jpg',
    images: [
      'https://images.unsplash.com/photo-1631545308269-9beefa74fb54?w=800',
    ],
    category: 'AC Repair',
    rating: 4.9,
    reviewCount: 156,
    location: 'Business Bay',
    startingPrice: 100,
    isVerified: true,
    isFeatured: true,
  },
  {
    id: '5',
    name: 'Glamour Beauty Studio',
    logo: '/placeholder.jpg',
    images: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    ],
    category: 'Beauty',
    rating: 4.8,
    reviewCount: 203,
    location: 'Palm Jumeirah',
    startingPrice: 250,
    isVerified: true,
  },
  {
    id: '6',
    name: 'Green Thumb Gardens',
    logo: '/placeholder.jpg',
    images: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
    ],
    category: 'Gardening',
    rating: 4.6,
    reviewCount: 67,
    location: 'Emirates Hills',
    startingPrice: 300,
    isVerified: true,
  },
  {
    id: '7',
    name: 'PetPal Care',
    logo: '/placeholder.jpg',
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    ],
    category: 'Pet Care',
    rating: 4.9,
    reviewCount: 89,
    location: 'Jumeirah',
    startingPrice: 120,
    isVerified: true,
  },
  {
    id: '8',
    name: 'Pro Paint Masters',
    logo: '/placeholder.jpg',
    images: [
      'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800',
    ],
    category: 'Painting',
    rating: 4.7,
    reviewCount: 54,
    location: 'Al Barsha',
    startingPrice: 500,
    isVerified: true,
  },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter vendors by category
  const filteredVendors = selectedCategory === 'all'
    ? MOCK_VENDORS
    : MOCK_VENDORS.filter(
        (v) => v.category.toLowerCase().replace(' ', '-') === selectedCategory
      );

  const featuredVendors = MOCK_VENDORS.filter((v) => v.isFeatured);
  const topRatedVendors = [...MOCK_VENDORS].sort((a, b) => b.rating - a.rating);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Category Tabs */}
      <CategoryTabs
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Main Content */}
      <main className="bg-gray-50 pb-16">
        {/* Featured Vendors */}
        <VendorSection
          title="Featured Vendors"
          subtitle="Hand-picked service providers for quality assurance"
          vendors={featuredVendors}
          viewAllLink="/vendors?featured=true"
        />

        {/* All Vendors / Filtered */}
        <VendorSection
          title={selectedCategory === 'all' ? 'Popular Services' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1).replace('-', ' ')} Services`}
          subtitle="Discover top-rated service providers in your area"
          vendors={filteredVendors}
          viewAllLink={`/vendors${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`}
          layout="grid"
        />

        {/* Top Rated */}
        <VendorSection
          title="Top Rated"
          subtitle="Highest rated vendors by our customers"
          vendors={topRatedVendors.slice(0, 6)}
          viewAllLink="/vendors?sort=rating"
        />

        {/* Features Section */}
        <section className="py-16 bg-white mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Why Choose Us</h2>
              <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                We connect you with verified professionals who deliver quality service
                every time.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<Shield className="h-8 w-8 text-blue-500" />}
                title="Verified Vendors"
                description="All our service providers are thoroughly vetted and verified"
              />
              <FeatureCard
                icon={<Clock className="h-8 w-8 text-green-500" />}
                title="Easy Scheduling"
                description="Book appointments at your convenience, 7 days a week"
              />
              <FeatureCard
                icon={<MapPin className="h-8 w-8 text-red-500" />}
                title="Local Professionals"
                description="Find trusted service providers in your neighborhood"
              />
              <FeatureCard
                icon={<Star className="h-8 w-8 text-yellow-500" />}
                title="Quality Guaranteed"
                description="Satisfaction guaranteed or your money back"
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
              <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                Book your service in just 3 simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <StepCard
                step={1}
                title="Browse Services"
                description="Explore our wide range of services and find what you need"
              />
              <StepCard
                step={2}
                title="Choose a Vendor"
                description="Compare ratings, reviews, and prices to pick the best fit"
              />
              <StepCard
                step={3}
                title="Book & Relax"
                description="Schedule your appointment and let the professionals handle it"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-900 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white">Ready to Get Started?</h2>
            <p className="mt-4 text-gray-300 max-w-xl mx-auto">
              Join thousands of satisfied customers who book services through our platform
              every day.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={ROUTES.VENDORS}>
                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                  Find Services Near You
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href={ROUTES.REGISTER}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow border border-gray-100">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

// Step Card Component
interface StepCardProps {
  step: number;
  title: string;
  description: string;
}

function StepCard({ step, title, description }: StepCardProps) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
        {step}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
