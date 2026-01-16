'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, X, Star, MapPin, Users, User } from 'lucide-react';
import { useVendor } from '@/hooks';
import api from '@/lib/api';

interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
}

interface Technician {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar?: string;
  initials: string;
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

export default function BookingProfessionalPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.vendorId as string;

  const { vendor, isLoading: vendorLoading, error: vendorError } = useVendor(vendorId);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<string | null | undefined>(undefined);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);

  // Load selected services from session storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(`booking_${vendorId}_services`);
      if (stored) {
        try {
          setSelectedServices(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse stored services', e);
        }
      }
    }
  }, [vendorId]);

  // Load selected professional from session storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(`booking_${vendorId}_professional`);
      if (stored !== null) {
        // If stored value is 'null' string, set to null (Any professional)
        // Otherwise, set to the stored ID
        setSelectedProfessional(stored === 'null' ? null : stored);
      }
    }
  }, [vendorId]);

  // Fetch technicians
  useEffect(() => {
    const fetchTechnicians = async () => {
      if (!vendorId) return;
      
      setIsLoadingTechnicians(true);
      try {
        const response = await api.get(`/public/vendors/${vendorId}/technicians`);
        const techs = response.data.data || [];
        setTechnicians(techs);
        
        // Update professional name based on selection
        if (selectedProfessional === null) {
          setSelectedProfessionalName('Any professional');
        } else if (selectedProfessional) {
          const tech = techs.find((t: Technician) => t.id === selectedProfessional);
          if (tech) {
            setSelectedProfessionalName(tech.full_name);
          }
        }
      } catch (error) {
        console.error('Failed to fetch technicians', error);
        setTechnicians([]);
      } finally {
        setIsLoadingTechnicians(false);
      }
    };

    fetchTechnicians();
  }, [vendorId, selectedProfessional]);

  // Calculate subtotal (original prices)
  const subtotal = useMemo(() => {
    return selectedServices.reduce((sum, service) => {
      const price = typeof service.price === 'number' ? service.price : parseFloat(String(service.price || 0));
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

  // Get location string
  const location = useMemo(() => {
    if (!vendor?.service_areas || vendor.service_areas.length === 0) {
      return 'Location not available';
    }
    return vendor.service_areas[0].name;
  }, [vendor]);

  // Handle continue
  const handleContinue = () => {
    // Allow null (Any professional) as a valid selection
    if (selectedProfessional === undefined) return;
    // Store selected professional and navigate to time selection
    if (typeof window !== 'undefined') {
      // Store null as string 'null' or empty string, or the actual ID
      sessionStorage.setItem(`booking_${vendorId}_professional`, selectedProfessional || 'null');
    }
    router.push(`/booking/${vendorId}/time`);
  };

  // Handle back
  const handleBack = () => {
    router.push(`/booking/${vendorId}`);
  };

  // Handle close
  const handleClose = () => {
    router.push(`/vendor/${vendorId}`);
  };

  // Handle professional selection
  const handleSelectProfessional = (professionalId: string | null) => {
    setSelectedProfessional(professionalId);
  };

  if (vendorLoading || isLoadingTechnicians) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (vendorError || !vendor) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-gray-600 mb-6">
            {vendorError?.message || 'Failed to load vendor information.'}
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
                <span>Services</span>
                <span className="text-gray-400">•</span>
                <span className="font-medium text-gray-900">Professional</span>
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
          {/* Left Pane - Professional Selection */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Select professional</h1>

            {/* Professional List */}
            <div className="space-y-4">
              {/* Any Professional Option */}
              <div
                onClick={() => handleSelectProfessional(null)}
                className={`bg-white border-2 rounded-xl p-5 cursor-pointer transition-all ${
                  selectedProfessional === null
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Any professional</h3>
                      <p className="text-sm text-gray-500">for maximum availability</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectProfessional(null);
                    }}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      selectedProfessional === null
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {selectedProfessional === null ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>

              {/* Individual Professionals */}
              {technicians.map((technician) => {
                const isSelected = selectedProfessional === technician.id;
                return (
                  <div
                    key={technician.id}
                    onClick={() => handleSelectProfessional(technician.id)}
                    className={`bg-white border-2 rounded-xl p-5 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {technician.avatar ? (
                          <img
                            src={technician.avatar}
                            alt={technician.full_name}
                            className="h-12 w-12 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                            <span className="text-purple-600 font-semibold text-sm">
                              {technician.initials}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{technician.full_name}</h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Open profile modal or navigate to profile
                            }}
                            className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
                          >
                            View profile
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectProfessional(technician.id);
                        }}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                          isSelected
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                );
              })}

              {technicians.length === 0 && !isLoadingTechnicians && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No professionals available for this vendor.</p>
                </div>
              )}
            </div>
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
                      const selectedProfessionalName = selectedProfessional === null 
                        ? 'any professional' 
                        : technicians.find(t => t.id === selectedProfessional)?.full_name || 'selected professional';
                      
                      return (
                        <div
                          key={service.id}
                          className="bg-white p-3 rounded-lg"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 mb-1">{service.name}</p>
                              <p className="text-xs text-gray-500">
                                {service.duration} mins • {service.name} with {selectedProfessionalName}
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

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={selectedProfessional === undefined}
                className={`w-full py-4 rounded-lg font-semibold transition-colors ${
                  selectedProfessional !== undefined
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
