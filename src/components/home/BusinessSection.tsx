'use client';

import Image from 'next/image';
import { ArrowRight, Star } from 'lucide-react';

export function BusinessSection() {
  return (
    <section className="bg-white py-16 md:py-24 relative overflow-hidden">
      {/* Green gradient background */}
      <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[50%] bg-gradient-to-r from-lime-100/60 via-lime-50/40 to-transparent z-0"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="text-center lg:text-left relative z-10">
            {/* Headline */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Fresha for business
            </h2>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-xl mx-auto lg:mx-0">
              Supercharge your business with the world&apos;s top booking platform for salons and spas. Independently voted no. 1 by industry professionals.
            </p>

            {/* Call to Action Button */}
            <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3.5 rounded-full font-medium transition-colors flex items-center gap-2 mx-auto lg:mx-0 mb-8">
              Find out more
              <ArrowRight className="h-5 w-5" />
            </button>

            {/* Capterra Review */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base font-medium text-gray-900">Excellent 5/5</span>
              </div>
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                Over 1250 reviews on{' '}
                <span className="font-semibold text-gray-900">Capterra</span>
              </p>
            </div>
          </div>

          {/* Spacer for grid layout on mobile */}
          <div className="lg:hidden relative aspect-[4/3]"></div>
        </div>
      </div>

      {/* Right Side - Image - Stretches to right edge, positioned absolutely */}
      <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[50vw] min-w-[600px] flex items-center z-0">
        <div className="relative w-full h-[600px] max-h-[700px] rounded-lg overflow-hidden">
          <Image
            src="/section3.webp"
            alt="Fresha for business - Platform screenshots"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Mobile Image */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
          <Image
            src="/section3.webp"
            alt="Fresha for business - Platform screenshots"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
