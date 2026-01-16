'use client';

import { MapPin, Check } from 'lucide-react';

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
  mapUrl?: string;
  onGetDirections?: () => void;
}

export function AboutSection({
  description,
  location,
  openingHours,
  additionalInfo = ['Instant Confirmation', 'Pay by app'],
  mapUrl,
  onGetDirections,
}: AboutSectionProps) {
  return (
    <div className="space-y-8" id="about">
      <h2 className="text-2xl font-bold text-gray-900">About</h2>

      {/* Description */}
      <p className="text-gray-700 leading-relaxed">{description}</p>

      {/* Map Placeholder */}
      <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-[2/1]">
        {mapUrl ? (
          <iframe
            src={mapUrl}
            className="w-full h-full"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Map view</p>
            </div>
          </div>
        )}

        {/* Map Pin Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
          <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center shadow-lg">
            <div className="w-3 h-3 bg-white rounded-full" />
          </div>
          <div className="w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1" />
        </div>
      </div>

      {/* Location with Get Directions */}
      <div className="flex items-center gap-2 text-gray-700">
        <span>{location}</span>
        <button
          onClick={onGetDirections}
          className="text-green-600 font-medium hover:underline"
        >
          Get directions
        </button>
      </div>

      {/* Opening Times & Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Additional information
          </h3>
          <div className="space-y-3">
            {additionalInfo.map((info, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700">{info}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
