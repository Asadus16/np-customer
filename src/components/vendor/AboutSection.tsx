'use client';

import { BadgeCheck, CreditCard } from 'lucide-react';
import { VendorMap } from './VendorMap';

export interface OpeningHours {
  day: string;
  hours: string;
  isToday?: boolean;
}

interface AboutSectionProps {
  description: string;
  location: string;
  openingHours: OpeningHours[];
  additionalInfo?: string[];
  latitude?: number | null;
  longitude?: number | null;
  vendorName?: string;
  onGetDirections?: () => void;
}

export function AboutSection({
  description,
  location,
  openingHours,
  latitude,
  longitude,
  vendorName = 'Vendor',
  onGetDirections,
}: AboutSectionProps) {
  return (
    <div className="space-y-8" id="about">
      <h2
        className="text-[28px] font-[550] leading-9 text-[rgb(20,20,20)]"
        style={{ fontFamily: 'RoobertPRO, AktivGroteskVF, sans-serif' }}
      >About</h2>

      {/* Description */}
      <p className="text-gray-700 leading-relaxed">{description}</p>

      {/* Map */}
      <div className="rounded-xl overflow-hidden">
        <VendorMap
          latitude={latitude || 0}
          longitude={longitude || 0}
          vendorName={vendorName}
          address={location}
        />
      </div>

      {/* Location with Get Directions */}
      <div className="flex flex-wrap items-center gap-2 text-gray-700 text-sm md:text-base">
        <span className="break-words">{location}</span>
        <button
          onClick={onGetDirections}
          className="text-blue-600 font-medium hover:underline whitespace-nowrap"
        >
          Get directions
        </button>
      </div>

      {/* Opening Times & Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 mt-8">
        {/* Opening Times */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Opening times</h3>
          <div className="space-y-3">
            {openingHours.map((item) => (
              <div
                key={item.day}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.hours === 'Closed' ? 'bg-gray-300' : 'bg-green-500'
                    }`}
                  />
                  <span
                    className={`${
                      item.isToday ? 'font-semibold text-gray-900' : 'text-gray-700'
                    }`}
                  >
                    {item.day}
                  </span>
                </div>
                <span
                  className={`${
                    item.isToday ? 'font-semibold text-gray-900' : 'text-gray-600'
                  }`}
                >
                  {item.hours}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="md:ml-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Additional information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Instant Confirmation</span>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Pay by app</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
