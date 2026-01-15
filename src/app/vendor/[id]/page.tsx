'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import {
  ImageGallery,
  VendorInfo,
  ServiceList,
  BookingCard,
  MobileBookingBar,
  Service,
  ServiceCategory,
} from '@/components/vendor';
import { useVendor } from '@/hooks';

/**
 * Map API vendor data to component format
 */
function mapVendorToComponentFormat(vendor: any) {
  const location = vendor.service_areas && vendor.service_areas.length > 0
    ? vendor.service_areas[0].name
    : 'Location not available';

  // Collect all images from services and sub-services
  const images: string[] = [];
  if (vendor.services) {
    vendor.services.forEach((service: any) => {
      if (service.image && !images.includes(service.image)) {
        images.push(service.image);
      }
      if (service.sub_services) {
        service.sub_services.forEach((subService: any) => {
          if (subService.images && Array.isArray(subService.images)) {
            subService.images.forEach((img: string) => {
              if (img && !images.includes(img)) {
                images.push(img);
              }
            });
          }
        });
      }
    });
  }

  // Use placeholder if no images
  if (images.length === 0) {
    images.push('/placeholder.jpg');
  }

  return {
    id: vendor.id,
    name: vendor.name,
    logo: vendor.logo || '/placeholder.jpg',
    description: vendor.description || 'No description available',
    category: vendor.category?.name || 'Uncategorized',
    rating: vendor.rating || 0,
    reviewCount: vendor.reviews_count || 0,
    location,
    isVerified: true,
    responseTime: vendor.response_time || 'Within 1 hour',
    images,
  };
}

/**
 * Map API services to ServiceCategory format
 */
function mapServicesToCategories(services: any[]): ServiceCategory[] {
  if (!services || services.length === 0) {
    return [];
  }

  return services.map((service) => {
    const subServices: Service[] = (service.sub_services || []).map((subService: any) => ({
      id: subService.id,
      name: subService.name,
      description: subService.description || service.description,
      price: subService.price || 0,
      duration: subService.duration || 0,
      image: subService.images && subService.images.length > 0 ? subService.images[0] : service.image,
      isPopular: false, // You can add logic to determine popular services
    }));

    return {
      id: service.id,
      name: service.name,
      services: subServices,
    };
  });
}

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.id as string;
  const { vendor: vendorData, isLoading, error } = useVendor(vendorId);
  const [selectedServices, setSelectedServices] = useState<
    { service: Service; quantity: number }[]
  >([]);
  const [showMobileCart, setShowMobileCart] = useState(false);

  // Map vendor data to component format
  const vendor = useMemo(() => {
    if (!vendorData) return null;
    return mapVendorToComponentFormat(vendorData);
  }, [vendorData]);

  // Map services to categories
  const serviceCategories = useMemo(() => {
    if (!vendorData?.services) return [];
    return mapServicesToCategories(vendorData.services);
  }, [vendorData]);

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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Vendor Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error?.message || 'The vendor you are looking for does not exist or has been removed.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

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
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
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

      {/* No Services Message */}
      {serviceCategories.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">No services available at this time.</p>
          </div>
        </div>
      )}

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
