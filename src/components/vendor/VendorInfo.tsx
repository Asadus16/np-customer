'use client';

import Image from 'next/image';
import { Star, MapPin, Clock, CheckCircle, Award, Shield } from 'lucide-react';

interface VendorInfoProps {
  vendor: {
    id: string;
    name: string;
    logo: string;
    description: string;
    category: string;
    rating: number;
    reviewCount: number;
    location: string;
    isVerified?: boolean;
    yearsInBusiness?: number;
    responseTime?: string;
    completedJobs?: number;
  };
}

export function VendorInfo({ vendor }: VendorInfoProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
          {vendor.logo ? (
            <Image
              src={vendor.logo}
              alt={vendor.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
              {vendor.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900">{vendor.name}</h1>
            {vendor.isVerified && (
              <CheckCircle className="h-5 w-5 text-blue-500" />
            )}
          </div>
          <p className="text-gray-600">{vendor.category}</p>
          <div className="flex items-center gap-4 mt-2">
            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-gray-900 text-gray-900" />
              <span className="font-medium">{vendor.rating.toFixed(1)}</span>
              <span className="text-gray-500">({vendor.reviewCount} reviews)</span>
            </div>
            {/* Location */}
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{vendor.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-200">
        {vendor.yearsInBusiness && (
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-6 w-6 text-gray-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {vendor.yearsInBusiness}+ years
            </p>
            <p className="text-sm text-gray-500">In business</p>
          </div>
        )}
        {vendor.responseTime && (
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {vendor.responseTime}
            </p>
            <p className="text-sm text-gray-500">Response time</p>
          </div>
        )}
        {vendor.completedJobs && (
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Shield className="h-6 w-6 text-gray-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {vendor.completedJobs.toLocaleString()}+
            </p>
            <p className="text-sm text-gray-500">Jobs completed</p>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
        <p className="text-gray-600 leading-relaxed">{vendor.description}</p>
      </div>

      {/* Highlights */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Highlights</h2>
        <div className="grid grid-cols-2 gap-3">
          <HighlightItem icon={<CheckCircle className="h-5 w-5" />} text="Licensed & Insured" />
          <HighlightItem icon={<Clock className="h-5 w-5" />} text="Same Day Service" />
          <HighlightItem icon={<Shield className="h-5 w-5" />} text="Satisfaction Guaranteed" />
          <HighlightItem icon={<Star className="h-5 w-5" />} text="Top Rated Provider" />
        </div>
      </div>
    </div>
  );
}

function HighlightItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <span className="text-gray-600">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{text}</span>
    </div>
  );
}
