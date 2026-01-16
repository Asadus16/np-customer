'use client';

import { Star, MapPin } from 'lucide-react';

interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration: number;
  durationMax?: number;
  category: string;
  serviceCount?: number;
  gender?: string;
}

interface Vendor {
  id: string;
  name: string;
  logo?: string;
  rating?: number;
  reviews_count?: number;
  service_areas?: { name: string }[];
}

interface BookingSidebarProps {
  vendor: Vendor;
  selectedServices: SelectedService[];
  total: number;
  onContinue: () => void;
  continueDisabled?: boolean;
  continueLabel?: string;
  isLoading?: boolean;
  showDurationRange?: boolean;
  children?: React.ReactNode;
}

function formatDurationRange(min: number, max?: number): string {
  if (!max || min === max) {
    if (min >= 60) {
      const hours = Math.floor(min / 60);
      const mins = min % 60;
      return mins > 0 ? `${hours}h ${mins}mins` : `${hours}h`;
    }
    return `${min}mins`;
  }
  return `${min}-${max}mins`;
}

export function BookingSidebar({
  vendor,
  selectedServices,
  total,
  onContinue,
  continueDisabled = false,
  continueLabel = 'Continue',
  isLoading = false,
  showDurationRange = true,
  children,
}: BookingSidebarProps) {
  const location = vendor.service_areas?.[0]?.name || 'Location not available';

  return (
    <div className="w-full lg:w-105 shrink-0">
      <div className="lg:sticky lg:top-24 bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col lg:h-[calc(100vh-140px)]">
        {/* Vendor Info */}
        <div className="p-6">
          <div className="flex gap-4">
            {vendor.logo ? (
              <img
                src={vendor.logo}
                alt={vendor.name}
                className="w-14 h-14 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-gray-100 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-gray-900 mb-1 truncate">{vendor.name}</h2>
              <div className="flex items-center gap-1 mb-1">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3.5 w-3.5 ${
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
                <span className="text-sm text-gray-500">
                  ({(vendor.reviews_count || 0).toLocaleString()})
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate">{location}</p>
            </div>
          </div>
        </div>

        {/* Selected Services - Scrollable */}
        <div className="px-6 pb-6 flex-1 overflow-y-auto">
          {selectedServices.length > 0 ? (
            <div className="space-y-4">
              {selectedServices.map((service) => (
                <div key={service.id} className="flex justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm mb-0.5">{service.name}</p>
                    <p className="text-xs text-gray-500">
                      {showDurationRange
                        ? formatDurationRange(service.duration, service.durationMax)
                        : `${service.duration} mins`}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm shrink-0">
                    AED {service.price.toFixed(0)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No services selected</p>
          )}
        </div>

        {/* Additional content slot (for date/time display, etc.) */}
        {children}

        {/* Divider */}
        <div className="mx-6 border-t border-gray-100" />

        {/* Total */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            {selectedServices.length > 0 ? (
              <span className="font-bold text-lg text-gray-900">
                AED {total.toLocaleString()}
              </span>
            ) : (
              <span className="font-medium text-gray-400">free</span>
            )}
          </div>
        </div>

        {/* Continue Button */}
        <div className="p-6 pt-0 mt-auto">
          <button
            onClick={onContinue}
            disabled={continueDisabled || isLoading}
            className={`w-full py-4 rounded-full font-semibold transition-colors ${
              continueDisabled || isLoading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {isLoading ? 'Processing...' : continueLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
