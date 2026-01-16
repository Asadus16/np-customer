'use client';

import { MapPin, BadgeCheck, CreditCard } from 'lucide-react';

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

      {/* Map */}
      <div className="rounded-xl overflow-hidden bg-gray-100 aspect-[2/1]">
        <iframe
          src={mapUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115459.99826706795!2d55.13714375!3d25.076022!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43496ad9c645%3A0xbde66e5084295162!2sDubai%20-%20United%20Arab%20Emirates!5e0!3m2!1sen!2s!4v1705400000000!5m2!1sen!2s"}
          className="w-full h-full"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
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
