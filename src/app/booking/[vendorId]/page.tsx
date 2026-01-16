'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, X, Plus, Star, MapPin, Check } from 'lucide-react';
import { useVendor } from '@/hooks';
import { SubServiceApiResponse, ServiceApiResponse } from '@/services/vendorService';

interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
}

/**
 * Format duration in minutes to readable format
 */
function formatDuration(minutes: number | string | null | undefined): string {
  const numMinutes = typeof minutes === 'number' ? minutes : parseInt(String(minutes || 0), 10);
  if (isNaN(numMinutes) || numMinutes === 0) {
    return 'Duration not available';
  }
  if (numMinutes < 60) {
    return `${numMinutes} mins`;
  }
  const hours = Math.floor(numMinutes / 60);
  const mins = numMinutes % 60;
  if (mins === 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  }
  return `${hours} hr${hours > 1 ? 's' : ''}, ${mins} mins`;
}

/**
 * Format price for a service
 */
function formatPrice(price: number | string | null | undefined): string {
  const numPrice = typeof price === 'number' ? price : parseFloat(String(price || 0));
  if (isNaN(numPrice) || numPrice === 0) {
    return 'Price not available';
  }
  return `from ${numPrice.toFixed(2)} AED`;
}

/**
 * Get all sub-services from a service category
 */
function getAllSubServices(service: ServiceApiResponse): SubServiceApiResponse[] {
  return service.sub_services || [];
}

export default function BookingServicesPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.vendorId as string;

  const { vendor, isLoading, error } = useVendor(vendorId);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);

  // Get all service categories
  const serviceCategories = useMemo(() => {
    if (!vendor?.services) return [];
    return vendor.services.map(service => ({
      id: service.id,
      name: service.name,
      service,
    }));
  }, [vendor]);

  // Set initial category
  useEffect(() => {
    if (serviceCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(serviceCategories[0].id);
    }
  }, [serviceCategories, selectedCategory]);

  // Get current category services
  const currentCategoryServices = useMemo(() => {
    if (!selectedCategory || !vendor?.services) return [];
    const category = vendor.services.find(s => s.id === selectedCategory);
    return category ? getAllSubServices(category) : [];
  }, [selectedCategory, vendor]);

  // Calculate subtotal (original prices)
  const subtotal = useMemo(() => {
    return selectedServices.reduce((sum, service) => {
      const price = typeof service.price === 'number' ? service.price : parseFloat(String(service.price || 0));
      // Calculate original price (with 10% discount applied)
      const originalPrice = price / 0.9; // Reverse the 10% discount
      return sum + (isNaN(originalPrice) ? 0 : originalPrice);
    }, 0);
  }, [selectedServices]);

  // Calculate discount (10% off)
  const discount = useMemo(() => {
    return subtotal * 0.1;
  }, [subtotal]);

  // Calculate total (after discount)
  const total = useMemo(() => {
    return selectedServices.reduce((sum, service) => {
      const price = typeof service.price === 'number' ? service.price : parseFloat(String(service.price || 0));
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
  }, [selectedServices]);

  // Toggle service selection
  const toggleService = (subService: SubServiceApiResponse, categoryName: string) => {
    setSelectedServices(prev => {
      const existingIndex = prev.findIndex(s => s.id === subService.id);
      if (existingIndex >= 0) {
        return prev.filter((_, index) => index !== existingIndex);
      } else {
        // Ensure price is a number
        const price = typeof subService.price === 'number' 
          ? subService.price 
          : parseFloat(String(subService.price || 0));
        const duration = typeof subService.duration === 'number'
          ? subService.duration
          : parseInt(String(subService.duration || 0), 10);
        
        return [...prev, {
          id: subService.id,
          name: subService.name,
          price: isNaN(price) ? 0 : price,
          duration: isNaN(duration) ? 0 : duration,
          category: categoryName,
        }];
      }
    });
  };

  // Check if service is selected
  const isServiceSelected = (serviceId: string): boolean => {
    return selectedServices.some(s => s.id === serviceId);
  };

  // Get location string
  const location = useMemo(() => {
    if (!vendor?.service_areas || vendor.service_areas.length === 0) {
      return 'Location not available';
    }
    return vendor.service_areas[0].name;
  }, [vendor]);

  // Handle continue
  const handleContinue = () => {
    if (selectedServices.length === 0) return;
    // Store selected services and navigate to professional selection
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`booking_${vendorId}_services`, JSON.stringify(selectedServices));
    }
    router.push(`/booking/${vendorId}/professional`);
  };

  // Handle back
  const handleBack = () => {
    router.back();
  };

  // Handle close
  const handleClose = () => {
    router.push(`/vendor/${vendorId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-gray-600 mb-6">
            {error?.message || 'Failed to load vendor information.'}
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-6">
              <button
                onClick={handleBack}
                className="h-10 w-10 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium text-gray-900">Services</span>
                <span className="text-gray-400">•</span>
                <span>Professional</span>
                <span className="text-gray-400">•</span>
                <span>Time</span>
                <span className="text-gray-400">•</span>
                <span>Confirm</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="h-10 w-10 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 py-8">
          {/* Left Pane - Service Selection */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Services</h1>

            {/* Category Tabs */}
            {serviceCategories.length > 0 && (
              <div className="flex gap-4 mb-8 overflow-x-auto pb-2 hide-scrollbar">
                {serviceCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-black text-white'
                        : 'bg-transparent text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}

            {/* Category Sub-heading */}
            {selectedCategory && (
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {serviceCategories.find(c => c.id === selectedCategory)?.name || 'Services'}
              </h2>
            )}

            {/* Services List */}
            {currentCategoryServices.length > 0 ? (
              <div className="space-y-4">
                {currentCategoryServices.map((subService) => {
                  const isSelected = isServiceSelected(subService.id);
                  const categoryName = serviceCategories.find(c => c.id === selectedCategory)?.name || '';

                  return (
                    <div
                      key={subService.id}
                      className={`bg-white rounded-xl p-5 hover:shadow-md transition-shadow border-2 ${
                        isSelected
                          ? 'border-purple-500'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-2">{subService.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <span>{formatDuration(subService.duration)}</span>
                            <span>{formatPrice(subService.price)}</span>
                          </div>
                          {/* Offer badge */}
                          <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                            Save up to 10%
                          </span>
                          {subService.description && (
                            <p className="text-sm text-gray-500 mt-2">{subService.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => toggleService(subService, categoryName)}
                          className={`shrink-0 h-8 w-8 flex items-center justify-center rounded-full border-2 transition-all ${
                            isSelected
                              ? 'bg-white border-purple-500 text-purple-500'
                              : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                          aria-label={isSelected ? 'Remove service' : 'Add service'}
                        >
                          {isSelected ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No services available in this category.</p>
              </div>
            )}
          </div>

          {/* Right Pane - Order Summary */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              {/* Vendor Info */}
              <div className="mb-6">
                {vendor.logo && (
                  <img
                    src={vendor.logo}
                    alt={vendor.name}
                    className="w-16 h-16 rounded-lg object-cover mb-4"
                  />
                )}
                <h2 className="text-lg font-bold text-gray-900 mb-2">{vendor.name}</h2>
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(vendor.rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-900 ml-1">
                    {vendor.rating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-sm text-gray-600">
                    ({vendor.reviews_count || 0})
                  </span>
                </div>
                <div className="flex items-start gap-1 text-sm text-gray-600">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span className="line-clamp-2 text-xs">{location}</span>
                </div>
              </div>

              {/* Selected Services */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Selected Services</h3>
                {selectedServices.length > 0 ? (
                  <div className="space-y-3">
                    {selectedServices.map((service) => {
                      const originalPrice = (typeof service.price === 'number' ? service.price : parseFloat(String(service.price || 0)) || 0) / 0.9;
                      const discountedPrice = typeof service.price === 'number' ? service.price : parseFloat(String(service.price || 0)) || 0;
                      
                      return (
                        <div
                          key={service.id}
                          className="bg-white p-3 rounded-lg"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 mb-1">{service.name}</p>
                              <p className="text-xs text-gray-500">
                                {formatDuration(service.duration)} • {service.name} with any professional
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">
                              from ₹{discountedPrice.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-400 line-through">
                              ₹{originalPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No services selected</p>
                )}
              </div>

              {/* Cost Breakdown */}
              {selectedServices.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Discounts</span>
                    <span className="text-green-600">-₹{discount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-gray-900">
                      from ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Total (when no services) */}
              {selectedServices.length === 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-gray-400">free</span>
                  </div>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={selectedServices.length === 0}
                className={`w-full py-4 rounded-lg font-semibold transition-colors ${
                  selectedServices.length > 0
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
