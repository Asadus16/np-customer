'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, MapPin, Share, Heart } from 'lucide-react';
import {
  ImageGallery,
  ServiceList,
  ServiceTabs,
  FreshaSideCard,
  ReviewsSection,
  AboutSection,
  VendorNavBar,
  Service,
  Review,
  OpeningHours,
} from '@/components/vendor';

// Static Demo Data
const DEMO_VENDOR = {
  id: 'demo-vendor-001',
  name: 'Glamour Beauty Salon & Spa',
  logo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop',
  description: 'Welcome to Glamour Beauty Salon & Spa, your premier destination for luxury beauty services in Dubai. Our expert team of professionals is dedicated to providing exceptional services that leave you feeling refreshed, rejuvenated, and beautiful. From hair styling to spa treatments, we offer a comprehensive range of services tailored to meet your unique needs.',
  category: 'Beauty & Wellness',
  rating: 4.8,
  reviewCount: 1247,
  location: 'Downtown Dubai, Sheikh Mohammed bin Rashid Blvd, Dubai Mall Area',
  shortLocation: 'Downtown Dubai',
  isOpen: true,
  closeTime: '9:30 pm',
  breadcrumb: ['Home', 'Beauty & Wellness', 'Downtown Dubai', 'Glamour Beauty Salon & Spa'],
  images: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1470259078422-826894b933aa?w=800&h=600&fit=crop',
  ],
  latitude: 25.1972,
  longitude: 55.2744,
};

const DEMO_SERVICE_CATEGORIES = [
  {
    id: 'hair',
    name: 'Hair Services',
    services: [
      { id: 'hair-1', name: 'Women\'s Haircut & Styling', price: 150, duration: 45, priceFrom: true },
      { id: 'hair-2', name: 'Men\'s Haircut', price: 80, duration: 30, priceFrom: false },
      { id: 'hair-3', name: 'Hair Coloring - Full', price: 350, duration: 120, priceFrom: true },
      { id: 'hair-4', name: 'Highlights / Balayage', price: 450, duration: 150, priceFrom: true },
      { id: 'hair-5', name: 'Keratin Treatment', price: 600, duration: 180, priceFrom: true },
      { id: 'hair-6', name: 'Blow Dry & Styling', price: 100, duration: 45, priceFrom: false },
    ],
  },
  {
    id: 'nails',
    name: 'Nail Services',
    services: [
      { id: 'nail-1', name: 'Classic Manicure', price: 75, duration: 30, priceFrom: false },
      { id: 'nail-2', name: 'Gel Manicure', price: 120, duration: 45, priceFrom: false },
      { id: 'nail-3', name: 'Classic Pedicure', price: 95, duration: 45, priceFrom: false },
      { id: 'nail-4', name: 'Gel Pedicure', price: 150, duration: 60, priceFrom: false },
      { id: 'nail-5', name: 'Nail Art (per nail)', price: 15, duration: 10, priceFrom: true },
      { id: 'nail-6', name: 'Acrylic Nail Extensions', price: 250, duration: 90, priceFrom: true },
    ],
  },
  {
    id: 'facial',
    name: 'Facial Treatments',
    services: [
      { id: 'facial-1', name: 'Classic Facial', price: 200, duration: 60, priceFrom: false },
      { id: 'facial-2', name: 'Deep Cleansing Facial', price: 280, duration: 75, priceFrom: false },
      { id: 'facial-3', name: 'Anti-Aging Facial', price: 350, duration: 90, priceFrom: true },
      { id: 'facial-4', name: 'Hydrating Facial', price: 250, duration: 60, priceFrom: false },
      { id: 'facial-5', name: 'LED Light Therapy', price: 180, duration: 30, priceFrom: false },
    ],
  },
  {
    id: 'spa',
    name: 'Spa & Massage',
    services: [
      { id: 'spa-1', name: 'Swedish Massage (60 min)', price: 300, duration: 60, priceFrom: false },
      { id: 'spa-2', name: 'Deep Tissue Massage (60 min)', price: 350, duration: 60, priceFrom: false },
      { id: 'spa-3', name: 'Hot Stone Massage', price: 400, duration: 75, priceFrom: false },
      { id: 'spa-4', name: 'Aromatherapy Massage', price: 320, duration: 60, priceFrom: false },
      { id: 'spa-5', name: 'Full Body Scrub', price: 250, duration: 45, priceFrom: false },
      { id: 'spa-6', name: 'Moroccan Bath', price: 450, duration: 90, priceFrom: true },
    ],
  },
  {
    id: 'waxing',
    name: 'Waxing & Hair Removal',
    services: [
      { id: 'wax-1', name: 'Full Leg Wax', price: 150, duration: 30, priceFrom: false },
      { id: 'wax-2', name: 'Full Arm Wax', price: 100, duration: 20, priceFrom: false },
      { id: 'wax-3', name: 'Underarm Wax', price: 50, duration: 15, priceFrom: false },
      { id: 'wax-4', name: 'Brazilian Wax', price: 180, duration: 30, priceFrom: false },
      { id: 'wax-5', name: 'Full Body Wax', price: 450, duration: 90, priceFrom: true },
      { id: 'wax-6', name: 'Eyebrow Threading', price: 35, duration: 10, priceFrom: false },
    ],
  },
];

const DEMO_REVIEWS: Review[] = [
  {
    id: '1',
    authorName: 'Sarah Ahmed',
    authorInitial: 'S',
    date: 'Mon, 13 Jan 2026, 3:45 PM',
    rating: 5,
    text: 'Absolutely loved my experience! The staff was incredibly professional and friendly. My hair looks amazing after the balayage treatment. Will definitely be coming back!',
    avatarColor: 'bg-purple-500',
  },
  {
    id: '2',
    authorName: 'Fatima Al-Hassan',
    authorInitial: 'F',
    date: 'Sun, 12 Jan 2026, 11:30 AM',
    rating: 5,
    text: 'Best spa experience in Dubai! The Moroccan bath was heavenly. The ambiance is so relaxing and the therapists really know what they\'re doing.',
    avatarColor: 'bg-blue-500',
  },
  {
    id: '3',
    authorName: 'Maria Santos',
    authorInitial: 'M',
    date: 'Sat, 11 Jan 2026, 2:00 PM',
    rating: 4,
    text: 'Great nail services! My gel manicure lasted for 3 weeks without chipping. Only giving 4 stars because the wait time was a bit long.',
    avatarColor: 'bg-green-500',
  },
  {
    id: '4',
    authorName: 'Aisha Khan',
    authorInitial: 'A',
    date: 'Fri, 10 Jan 2026, 5:15 PM',
    rating: 5,
    text: 'I\'ve been coming here for years and they never disappoint. The anti-aging facial is my favorite - my skin always glows afterwards!',
    avatarColor: 'bg-orange-500',
  },
  {
    id: '5',
    authorName: 'Jennifer Lee',
    authorInitial: 'J',
    date: 'Thu, 9 Jan 2026, 10:00 AM',
    rating: 5,
    text: 'The keratin treatment transformed my frizzy hair completely. It\'s been 2 months and my hair is still silky smooth. Worth every dirham!',
    avatarColor: 'bg-pink-500',
  },
];

const DEMO_OPENING_HOURS: OpeningHours[] = [
  { day: 'Monday', hours: '10:00 am - 9:30 pm' },
  { day: 'Tuesday', hours: '10:00 am - 9:30 pm' },
  { day: 'Wednesday', hours: '10:00 am - 9:30 pm' },
  { day: 'Thursday', hours: '10:00 am - 9:30 pm', isToday: true },
  { day: 'Friday', hours: '2:00 pm - 10:00 pm' },
  { day: 'Saturday', hours: '10:00 am - 10:00 pm' },
  { day: 'Sunday', hours: '10:00 am - 9:30 pm' },
];

export default function DemoVendorPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>(DEMO_SERVICE_CATEGORIES[0].name);
  const [isFavorite, setIsFavorite] = useState(false);

  // Get services for active category
  const activeServices = useMemo(() => {
    const category = DEMO_SERVICE_CATEGORIES.find((c) => c.name === activeCategory);
    return category?.services || [];
  }, [activeCategory]);

  // Get all category names for tabs
  const categoryNames = DEMO_SERVICE_CATEGORIES.map((c) => c.name);

  const handleBookService = (service: Service) => {
    // Store the selected service in session storage
    const price = typeof service.price === 'number'
      ? service.price
      : parseFloat(String(service.price || 0));
    const duration = typeof service.duration === 'number'
      ? service.duration
      : parseInt(String(service.duration || 0), 10);

    const selectedService = {
      id: service.id,
      name: service.name,
      price: isNaN(price) ? 0 : price,
      originalPrice: isNaN(price) ? 0 : price,
      duration: isNaN(duration) ? 0 : duration,
      category: activeCategory,
    };

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        `booking_${DEMO_VENDOR.id}_services`,
        JSON.stringify([selectedService])
      );
    }

    router.push(`/demo/booking`);
  };

  const handleBookNow = () => {
    router.push(`/demo/booking`);
  };

  const handleGetDirections = () => {
    window.open(
      `https://maps.google.com/?daddr=${encodeURIComponent(DEMO_VENDOR.location)}`,
      '_blank'
    );
  };

  return (
    <>
      {/* Scroll-aware NavBar */}
      <VendorNavBar
        vendorName={DEMO_VENDOR.name}
        rating={DEMO_VENDOR.rating}
        reviewCount={DEMO_VENDOR.reviewCount}
        onBookNow={handleBookNow}
      />

      <div className="min-h-screen bg-white pb-24 lg:pb-0">
        {/* Breadcrumb */}
        <div className="px-4 md:px-8 lg:px-12 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500 overflow-x-auto hide-scrollbar">
            {DEMO_VENDOR.breadcrumb.map((item, index) => (
              <div key={index} className="flex items-center gap-2 shrink-0">
                {index > 0 && <span className="text-gray-400">·</span>}
                {index === DEMO_VENDOR.breadcrumb.length - 1 ? (
                  <span className="text-gray-700">{item}</span>
                ) : (
                  <Link
                    href={index === 0 ? '/' : '#'}
                    className="hover:text-gray-900 hover:underline whitespace-nowrap"
                  >
                    {item}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Vendor Header */}
        <div className="px-4 md:px-8 lg:px-12 mt-2 mb-4 md:mb-6">
          <h1 className="font-bold text-2xl md:text-4xl lg:text-5xl text-gray-900">
            {DEMO_VENDOR.name}
          </h1>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-3 gap-3">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm md:text-base">
              {/* Rating */}
              <div className="flex items-center gap-1">
                <span className="font-semibold text-blue-600">
                  {DEMO_VENDOR.rating.toFixed(1)}
                </span>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(DEMO_VENDOR.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-green-600 font-medium">
                  ({DEMO_VENDOR.reviewCount.toLocaleString()})
                </span>
              </div>

              <span className="text-gray-300 hidden md:inline">•</span>

              {/* Open Status */}
              <span className="font-medium text-green-600">Open</span>
              <span className="text-gray-600">until {DEMO_VENDOR.closeTime}</span>

              <span className="text-gray-300 hidden md:inline">•</span>

              {/* Location */}
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="truncate max-w-[150px] md:max-w-none">{DEMO_VENDOR.shortLocation}</span>
              </div>
              <button
                onClick={handleGetDirections}
                className="text-blue-600 font-medium hover:underline"
              >
                Get directions
              </button>
            </div>

            {/* Action Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <button className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                <Share className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
              >
                <Heart
                  className={`h-5 w-5 ${
                    isFavorite ? 'fill-red-500 text-red-500' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="px-4 md:px-8 lg:px-12" id="photos">
          <ImageGallery images={DEMO_VENDOR.images} vendorName={DEMO_VENDOR.name} />
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="px-4 md:px-8 lg:px-12 mt-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
            {/* Left Column - Main Content */}
            <div className="flex-1 min-w-0 space-y-10">
              {/* Services Section */}
              <div id="services">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Services</h2>

                {/* Category Tabs */}
                <ServiceTabs
                  categories={categoryNames}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                />

                {/* Service List */}
                <div className="mt-4">
                  <ServiceList
                    services={activeServices}
                    onBookService={handleBookService}
                  />
                </div>
              </div>

              {/* Reviews Section */}
              <ReviewsSection
                reviews={DEMO_REVIEWS}
                averageRating={DEMO_VENDOR.rating}
                totalReviews={DEMO_VENDOR.reviewCount}
              />

              {/* About Section */}
              <AboutSection
                description={DEMO_VENDOR.description}
                location={DEMO_VENDOR.location}
                openingHours={DEMO_OPENING_HOURS}
                latitude={DEMO_VENDOR.latitude}
                longitude={DEMO_VENDOR.longitude}
                vendorName={DEMO_VENDOR.name}
                onGetDirections={handleGetDirections}
              />
            </div>

            {/* Right Column - Side Card (Desktop Only) */}
            <div className="hidden lg:block w-110 shrink-0">
              <div className="sticky top-20">
                <FreshaSideCard
                  vendorName={DEMO_VENDOR.name}
                  rating={DEMO_VENDOR.rating}
                  reviewCount={DEMO_VENDOR.reviewCount}
                  isOpen={true}
                  closeTime={DEMO_VENDOR.closeTime}
                  location={DEMO_VENDOR.location}
                  openingHours={DEMO_OPENING_HOURS}
                  onBookNow={handleBookNow}
                  onGetDirections={handleGetDirections}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Treat yourself anytime, anywhere Section */}
        <section className="px-4 md:px-8 lg:px-12 py-12 mt-8 border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-0">
                Treat yourself anytime, anywhere
              </h2>
              <button className="self-start md:self-auto px-6 py-2.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                Other businesses in Dubai
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
              {[
                'Hair Styling',
                'Nail Art',
                'Facials',
                'Massage',
                'Waxing',
                'Makeup',
                'Eyebrow Threading',
                'Lash Extensions',
                'Hair Coloring',
                'Manicure',
                'Pedicure',
                'Spa Treatments',
                'Bridal Makeup',
                'Hair Extensions',
                'Keratin Treatment',
                'Body Scrub',
                'Aromatherapy',
                'Hot Stone Massage',
                'Deep Tissue Massage',
                'Swedish Massage',
                'Anti-Aging Facial',
                'Hydrating Facial',
                'Gel Nails',
                'Acrylic Nails',
                'Brazilian Wax',
                'Full Body Wax',
                'Hair Highlights',
                'Balayage',
                'Blow Dry',
                'Moroccan Bath',
              ].map((service) => (
                <Link
                  key={service}
                  href="#"
                  className="text-sm text-gray-600 hover:text-[#6950f3] hover:underline transition-colors"
                >
                  {service}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{DEMO_VENDOR.rating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">
                  ({DEMO_VENDOR.reviewCount.toLocaleString()})
                </span>
              </div>
              <p className="text-sm font-medium text-blue-600">
                Open until {DEMO_VENDOR.closeTime}
              </p>
            </div>
            <button
              onClick={handleBookNow}
              className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Book now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
