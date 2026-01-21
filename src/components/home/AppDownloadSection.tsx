'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';

export function AppDownloadSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Auto-play video when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Auto-play might be blocked by browser, that's okay
      });
    }
  }, []);

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - App Download Content */}
          <div className="text-center lg:text-left">
            {/* App Store Badges */}
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
              {/* Apple App Store */}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span className="text-sm text-black font-medium">Available on</span>
              </div>
              {/* Google Play */}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <span className="text-sm text-black font-medium">G</span>
              </div>
            </div>

            {/* Main Heading */}
            <h2 className="!text-6xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Download the noproblem app
            </h2>

            {/* Description */}
            <p className="text-lg text-gray-800 mb-8 max-w-md mx-auto lg:mx-0">
              Book unforgettable beauty and wellness experiences with the noproblem mobile app.
            </p>

            {/* QR Code */}
            <div className="flex justify-center lg:justify-start mt-8">
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <div className="w-32 h-32 bg-white rounded flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <svg className="w-20 h-20 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <span className="text-xs text-gray-500 mt-1 block">QR Code</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Two Phone Mockups */}
          <div className="relative">
            <div className="flex gap-4 justify-center lg:justify-end items-center">
              {/* Left Phone - Image (Trendy Studio) */}
              <div className="relative aspect-[9/16] w-56 md:w-72 lg:w-80">
                <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden ">
                  <Image
                    src="/homeImage.webp"
                    alt="Trendy Studio - noproblem app preview"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              {/* Right Phone - Video */}
              <div className="relative aspect-[9/16] w-48 md:w-60 lg:w-64">
                <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden  border-2 border-gray-900">
                  <video
                    ref={videoRef}
                    src="/homeVideo.mp4"
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
