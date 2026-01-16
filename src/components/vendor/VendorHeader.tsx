'use client';

import Link from 'next/link';
import { Star, MapPin, Heart, Share2, ChevronRight } from 'lucide-react';

interface VendorHeaderProps {
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  location: string;
  isFavorite: boolean;
  onFavorite: () => void;
  onShare: () => void;
}

export function VendorHeader({
  name,
  category,
  rating,
  reviewCount,
  location,
  isFavorite,
  onFavorite,
  onShare,
}: VendorHeaderProps) {
  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-gray-700">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/search?category=${encodeURIComponent(category)}`} className="hover:text-gray-700">
          {category}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900">{name}</span>
      </nav>

      {/* Vendor Title Row */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{name}</h1>

          {/* Rating, Reviews, Location */}
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm">
            {/* Rating */}
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5">
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
              <span className="font-medium text-gray-900">{rating.toFixed(1)}</span>
              <span className="text-gray-500">({reviewCount} reviews)</span>
            </div>

            {/* Divider */}
            <span className="text-gray-300">•</span>

            {/* Location */}
            <div className="flex items-center gap-1 text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onShare}
            className="p-2.5 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
            aria-label="Share"
          >
            <Share2 className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={onFavorite}
            className="p-2.5 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
            aria-label="Add to favorites"
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
