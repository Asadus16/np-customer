'use client';

import { useState } from 'react';
import { Star, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

interface OpeningHour {
  day: string;
  hours: string;
  isToday?: boolean;
}

interface FreshaSideCardProps {
  vendorName: string;
  rating: number;
  reviewCount: number;
  isOpen?: boolean;
  closeTime?: string;
  location: string;
  openingHours?: OpeningHour[];
  onBookNow?: () => void;
  onGetDirections?: () => void;
}

const DEFAULT_HOURS: OpeningHour[] = [
  { day: 'Monday', hours: '9:00 am - 10:00 pm' },
  { day: 'Tuesday', hours: '9:00 am - 10:00 pm' },
  { day: 'Wednesday', hours: '9:00 am - 10:00 pm' },
  { day: 'Thursday', hours: '9:00 am - 10:00 pm', isToday: true },
  { day: 'Friday', hours: '9:00 am - 10:00 pm' },
  { day: 'Saturday', hours: '9:00 am - 10:00 pm' },
  { day: 'Sunday', hours: '10:00 am - 10:00 pm' },
];

export function FreshaSideCard({
  vendorName,
  rating,
  reviewCount,
  isOpen = true,
  closeTime = '10:00 pm',
  location,
  openingHours = DEFAULT_HOURS,
  onBookNow,
  onGetDirections,
}: FreshaSideCardProps) {
  const [isHoursExpanded, setIsHoursExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header Section */}
      <div className="p-6 space-y-4">
        {/* Vendor Name */}
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">{vendorName}</h2>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">{rating.toFixed(1)}</span>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-base text-indigo-600 font-medium">
            ({reviewCount.toLocaleString()})
          </span>
        </div>

        {/* Featured Badge */}
        <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-full">
          Featured
        </span>

        {/* Book Now Button */}
        <button
          onClick={onBookNow}
          className="w-full bg-gray-900 text-white py-4 rounded-full text-base font-semibold hover:bg-gray-800 transition-colors"
        >
          Book now
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Info Section */}
      <div className="p-6 space-y-5">
        {/* Opening Hours */}
        <div>
          <button
            onClick={() => setIsHoursExpanded(!isHoursExpanded)}
            className="flex items-center gap-3 w-full text-left"
          >
            {/* Clock Icon */}
            <svg className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-green-600 font-medium">Open</span>
              <span className="text-gray-700">until {closeTime}</span>
            </div>
            {isHoursExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {/* Expanded Hours */}
          {isHoursExpanded && (
            <div className="mt-4 space-y-3 pl-8">
              {openingHours.map((item) => (
                <div
                  key={item.day}
                  className={`flex items-center justify-between ${
                    item.isToday ? 'font-semibold' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-gray-900">{item.day}</span>
                  </div>
                  <span className="text-gray-700">{item.hours}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-gray-700 mt-0.5 shrink-0" />
          <div>
            <p className="text-gray-900 leading-relaxed">{location}</p>
            <button
              onClick={onGetDirections}
              className="text-indigo-600 font-medium hover:underline mt-1"
            >
              Get directions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
