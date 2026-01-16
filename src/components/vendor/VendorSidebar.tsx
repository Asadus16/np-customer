'use client';

import { Star, MapPin, Clock, CreditCard, Gift, ChevronRight } from 'lucide-react';

interface OpeningHour {
  day: string;
  open: string;
  close: string;
  isClosed?: boolean;
}

interface VendorSidebarProps {
  name: string;
  rating: number;
  reviewCount: number;
  location: string;
  isFeatured?: boolean;
  openingHours?: OpeningHour[];
  onBookNow: () => void;
  onGetDirections: () => void;
}

export function VendorSidebar({
  name,
  rating,
  reviewCount,
  location,
  isFeatured = false,
  openingHours,
  onBookNow,
  onGetDirections,
}: VendorSidebarProps) {
  const defaultHours: OpeningHour[] = [
    { day: 'Mon', open: '09:00', close: '20:00' },
    { day: 'Tue', open: '09:00', close: '20:00' },
    { day: 'Wed', open: '09:00', close: '20:00' },
    { day: 'Thu', open: '09:00', close: '20:00' },
    { day: 'Fri', open: '09:00', close: '20:00' },
    { day: 'Sat', open: '10:00', close: '18:00' },
    { day: 'Sun', open: '10:00', close: '18:00', isClosed: true },
  ];

  const hours = openingHours || defaultHours;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
  const todayHours = hours.find((h) => h.day === today);

  const isOpenNow = () => {
    if (!todayHours || todayHours.isClosed) return false;
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const openTime = parseInt(todayHours.open.replace(':', ''));
    const closeTime = parseInt(todayHours.close.replace(':', ''));
    return currentTime >= openTime && currentTime < closeTime;
  };

  const openStatus = isOpenNow();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{name}</h2>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-900">{rating.toFixed(1)}</span>
          <span className="text-sm text-gray-500">({reviewCount})</span>
        </div>

        {/* Featured badge */}
        {isFeatured && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Featured
          </span>
        )}
      </div>

      {/* Book Now Button */}
      <div className="p-5 border-b border-gray-100">
        <button
          onClick={onBookNow}
          className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
        >
          Book now
        </button>
      </div>

      {/* Open Status */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-400" />
          <span className={`font-medium ${openStatus ? 'text-green-600' : 'text-red-500'}`}>
            {openStatus ? 'Open' : 'Closed'}
          </span>
          {todayHours && !todayHours.isClosed && (
            <span className="text-gray-500">
              · {openStatus ? `Closes ${todayHours.close}` : `Opens ${todayHours.open}`}
            </span>
          )}
        </div>
        <button className="text-sm text-gray-500 hover:text-gray-700 mt-1 flex items-center gap-1">
          See all opening hours
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      {/* Location */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start gap-2">
          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-gray-900">{location}</p>
            <button
              onClick={onGetDirections}
              className="text-sm text-gray-500 hover:text-gray-700 mt-1"
            >
              Get directions
            </button>
          </div>
        </div>
      </div>

      {/* Memberships */}
      <div className="p-5 border-b border-gray-100">
        <button className="w-full flex items-center justify-between text-left hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-gray-400" />
            <span className="font-medium text-gray-900">Memberships</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {/* Gift Cards */}
      <div className="p-5">
        <button className="w-full flex items-center justify-between text-left hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            <Gift className="h-5 w-5 text-gray-400" />
            <span className="font-medium text-gray-900">Gift cards</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
