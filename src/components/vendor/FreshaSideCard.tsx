'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [showHeader, setShowHeader] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer with hysteresis to prevent jitter
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const SHOW_THRESHOLD = 0.75;
    const HIDE_THRESHOLD = 0.60;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const ratio = entry.intersectionRatio;
          if (ratio >= SHOW_THRESHOLD) {
            setShowHeader(true);
          } else if (ratio < HIDE_THRESHOLD) {
            setShowHeader(false);
          }
        });
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.65, 0.7, 0.75, 0.8, 0.9, 1],
        rootMargin: '0px',
      }
    );

    observer.observe(card);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={cardRef} className="bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden w-110">
      {/* Header Section */}
      <div className="p-8 space-y-5">
        {/* Vendor Name, Rating, Featured with shutter slider transition */}
        <div
          className="overflow-hidden transition-[grid-template-rows] duration-300 ease-out grid"
          style={{
            gridTemplateRows: showHeader ? '1fr' : '0fr',
          }}
        >
          <div className="min-h-0 space-y-5">
            {/* Vendor Name */}
            <h2 className={`text-4xl font-bold text-gray-900 leading-tight transition-all duration-300 ${
              showHeader ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}>{vendorName}</h2>

            {/* Rating */}
            <div className={`flex items-center gap-2 transition-all duration-300 ${
              showHeader ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}>
              <span className="text-xl font-bold text-gray-900">{rating.toFixed(1)}</span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= Math.round(rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg text-indigo-600 font-medium">
                ({reviewCount.toLocaleString()})
              </span>
            </div>

            {/* Featured Badge */}
            <span className={`inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-full border border-indigo-200 transition-all duration-300 ${
              showHeader ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}>
              Featured
            </span>
          </div>
        </div>

        {/* Book Now Button - Always visible */}
        <button
          onClick={onBookNow}
          className="w-full bg-gray-900 text-white py-3 rounded-full text-base font-semibold hover:bg-gray-800 transition-colors"
        >
          Book now
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Info Section */}
      <div className="p-8 space-y-6">
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
              <span className={`font-medium ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
                {isOpen ? 'Open' : 'Closed'}
              </span>
              {closeTime && (
                <span className="text-gray-700">until {closeTime}</span>
              )}
            </div>
            {isHoursExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {/* Expanded Hours with slide transition */}
          <div
            className="overflow-hidden transition-[grid-template-rows] duration-300 ease-out grid"
            style={{
              gridTemplateRows: isHoursExpanded ? '1fr' : '0fr',
            }}
          >
            <div className="min-h-0">
              <div className="mt-4 space-y-3">
                {openingHours.map((item) => {
                  const isClosed = item.hours === 'Closed' || item.hours === 'Not set';
                  // Split multiple slots by comma
                  const slots = item.hours.split(', ');
                  const hasMultipleSlots = slots.length > 1;

                  return (
                    <div
                      key={item.day}
                      className={`flex items-start justify-between gap-4 ${item.isToday ? 'font-semibold' : ''}`}
                    >
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isClosed ? 'bg-gray-400' : 'bg-green-500'}`} />
                        <span className="text-gray-900">{item.day}</span>
                      </div>
                      {hasMultipleSlots ? (
                        <div className="text-right space-y-0.5">
                          {slots.map((slot, index) => (
                            <div key={index} className="text-gray-700">
                              {slot.trim()}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className={isClosed ? 'text-gray-500' : 'text-gray-700'}>{item.hours}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
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
