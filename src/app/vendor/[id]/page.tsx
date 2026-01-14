'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  ImageGallery,
  VendorInfo,
  ServiceList,
  BookingCard,
  MobileBookingBar,
  Service,
  ServiceCategory,
} from '@/components/vendor';

// Mock vendor data - will be replaced with API call
const MOCK_VENDOR = {
  id: '1',
  name: 'SparkleClean Services',
  logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200',
  description:
    'SparkleClean Services is a premium home cleaning company serving Dubai for over 8 years. We pride ourselves on delivering exceptional cleaning services with attention to detail and customer satisfaction. Our team of trained professionals uses eco-friendly products and state-of-the-art equipment to ensure your home is spotless.',
  category: 'Home Cleaning',
  rating: 4.9,
  reviewCount: 128,
  location: 'Dubai Marina, UAE',
  isVerified: true,
  yearsInBusiness: 8,
  responseTime: 'Within 1 hour',
  completedJobs: 2500,
  images: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200',
    'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800',
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800',
    'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800',
  ],
};

const MOCK_SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'regular',
    name: 'Regular Cleaning',
    services: [
      {
        id: 's1',
        name: 'Studio/1BR Deep Clean',
        description: 'Complete deep cleaning for studio or 1-bedroom apartments',
        price: 150,
        duration: 120,
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
        isPopular: true,
      },
      {
        id: 's2',
        name: '2BR Deep Clean',
        description: 'Complete deep cleaning for 2-bedroom apartments',
        price: 200,
        duration: 180,
        image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400',
      },
      {
        id: 's3',
        name: '3BR Deep Clean',
        description: 'Complete deep cleaning for 3-bedroom apartments',
        price: 280,
        duration: 240,
      },
      {
        id: 's4',
        name: 'Villa Cleaning (Small)',
        description: 'Deep cleaning for small villas up to 3 bedrooms',
        price: 350,
        duration: 300,
      },
    ],
  },
  {
    id: 'specialized',
    name: 'Specialized Services',
    services: [
      {
        id: 's5',
        name: 'Move In/Out Cleaning',
        description: 'Thorough cleaning for moving in or out of a property',
        price: 400,
        duration: 360,
        isPopular: true,
      },
      {
        id: 's6',
        name: 'Post-Construction Cleaning',
        description: 'Heavy-duty cleaning after renovation or construction',
        price: 500,
        duration: 420,
      },
      {
        id: 's7',
        name: 'Office Cleaning',
        description: 'Professional cleaning for office spaces',
        price: 250,
        duration: 180,
      },
    ],
  },
  {
    id: 'addons',
    name: 'Add-on Services',
    services: [
      {
        id: 's8',
        name: 'Window Cleaning (Interior)',
        description: 'Interior window cleaning, includes frames and sills',
        price: 50,
        duration: 30,
      },
      {
        id: 's9',
        name: 'Oven Deep Clean',
        description: 'Thorough oven and stovetop cleaning',
        price: 75,
        duration: 45,
      },
      {
        id: 's10',
        name: 'Fridge Deep Clean',
        description: 'Complete refrigerator cleaning and sanitization',
        price: 60,
        duration: 30,
      },
      {
        id: 's11',
        name: 'Laundry & Ironing',
        description: 'Washing, drying, and ironing of clothes',
        price: 80,
        duration: 90,
      },
    ],
  },
];

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedServices, setSelectedServices] = useState<
    { service: Service; quantity: number }[]
  >([]);
  const [showMobileCart, setShowMobileCart] = useState(false);

  // In production, fetch vendor data based on params.id
  const vendor = MOCK_VENDOR;
  const serviceCategories = MOCK_SERVICE_CATEGORIES;

  const handleServiceToggle = (service: Service) => {
    setSelectedServices((prev) => {
      const existing = prev.find((s) => s.service.id === service.id);
      if (existing) {
        return prev.filter((s) => s.service.id !== service.id);
      }
      return [...prev, { service, quantity: 1 }];
    });
  };

  const handleQuantityChange = (serviceId: string, delta: number) => {
    setSelectedServices((prev) =>
      prev
        .map((item) => {
          if (item.service.id === serviceId) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.filter((item) => item.service.id !== serviceId)
    );
  };

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-0">
      {/* Back Navigation - Mobile */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <span className="font-medium text-gray-900 truncate">{vendor.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Navigation - Desktop */}
        <div className="hidden md:block mb-6">
          <Link
            href="/vendors"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to vendors</span>
          </Link>
        </div>

        {/* Image Gallery */}
        <ImageGallery images={vendor.images} vendorName={vendor.name} />

        {/* Content Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Vendor Info & Services */}
          <div className="lg:col-span-2 space-y-8">
            <VendorInfo vendor={vendor} />

            <ServiceList
              categories={serviceCategories}
              selectedServices={selectedServices}
              onServiceToggle={handleServiceToggle}
              onQuantityChange={handleQuantityChange}
            />
          </div>

          {/* Right Column - Booking Card (Desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <BookingCard
                vendorId={vendor.id}
                vendorName={vendor.name}
                selectedServices={selectedServices}
                onRemoveService={handleRemoveService}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <MobileBookingBar
        selectedServices={selectedServices}
        onViewCart={() => setShowMobileCart(true)}
      />

      {/* Mobile Cart Modal */}
      {showMobileCart && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileCart(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Your Booking</h3>
              <button
                onClick={() => setShowMobileCart(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="h-5 w-5 rotate-[270deg]" />
              </button>
            </div>
            <div className="p-4">
              <BookingCard
                vendorId={vendor.id}
                vendorName={vendor.name}
                selectedServices={selectedServices}
                onRemoveService={handleRemoveService}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
