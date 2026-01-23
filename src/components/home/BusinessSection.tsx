'use client';

import Image from 'next/image';
import { ArrowRight, Star } from 'lucide-react';

export function BusinessSection() {
  return (
    <section className="relative w-full overflow-hidden bg-white">
      {/* Mobile Layout - Stacked */}
      <div className="lg:hidden">
        <div className="px-4 py-8">
          {/* Headline */}
          <h2 className="text-[32px] leading-[38px] font-bold text-gray-900 mb-4">
            noproblem for business
          </h2>

          {/* Description */}
          <p className="text-base text-gray-700 mb-6">
            Supercharge your business with the world&apos;s top booking platform for salons and spas. Independently voted no. 1 by industry professionals.
          </p>

          {/* Call to Action Button */}
          <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3.5 rounded-full font-medium transition-colors flex items-center gap-2 mb-6">
            Find out more
            <ArrowRight className="h-5 w-5" />
          </button>

          {/* Capterra Review */}
          <div className="flex flex-col mb-6">
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

        {/* Mobile Image */}
        <div className="w-full h-[300px] relative">
          <img
            src="/section3.webp"
            alt="noproblem for business - Platform screenshots"
            className="w-full h-full object-cover object-left"
          />
        </div>
      </div>

      {/* Desktop Layout - Side by Side with Absolute Positioning */}
      <div className="hidden lg:block relative min-h-[600px] md:min-h-[700px]">
        {/* Full Width Image Container */}
        <div className="absolute inset-0 w-full h-full z-0">
          <div className="relative w-full h-full">
            <img
              src="/section3.webp"
              alt="noproblem for business - Platform screenshots"
              style={{ right: '0px', width: '80%', position: 'absolute', height: '100%' }}
              className="object-cover right-0 w-[70%]"
            />
          </div>
        </div>

        {/* Absolutely Positioned Text Content */}
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl">
              {/* Headline */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                noproblem for business
              </h2>

              {/* Description */}
              <p className="text-lg md:text-xl text-gray-700 mb-8">
                Supercharge your business with the world&apos;s top booking platform for salons and spas. Independently voted no. 1 by industry professionals.
              </p>

              {/* Call to Action Button */}
              <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3.5 rounded-full font-medium transition-colors flex items-center gap-2 mb-8">
                Find out more
                <ArrowRight className="h-5 w-5" />
              </button>

              {/* Capterra Review */}
              <div className="flex flex-col">
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
          </div>
        </div>
      </div>
    </section>
  );
}
