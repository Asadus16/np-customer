'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const countries = [
  'Australia',
  'Bahrain',
  'Barbados',
  'Belgium',
  'Brazil',
  'Canada',
  'Denmark',
  'France',
  'Germany',
  'Greece',
  'Ireland',
  'Italy',
  'Malta',
  'Mexico',
];

const categories = [
  'Hair Salons',
  'Nail Salons',
  'Eyebrows & Lashes',
  'Beauty Salons',
  'Barbers',
  'Massages',
  'Spas & Saunas',
  'Waxing Salons',
];

const cities = ['Sydney', 'Melbourne', 'Perth', 'Brisbane', 'Gold Coast'];

export function BrowseByCitySection() {
  const [selectedCountry, setSelectedCountry] = useState('Australia');

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <h2 
          className="mb-8"
          style={{
            fontFamily: 'RoobertPRO, AktivGroteskVF, sans-serif',
            fontStyle: 'normal',
            fontWeight: 600,
            color: 'rgb(20, 20, 20)',
            fontSize: '28px',
            lineHeight: '36px'
          }}
        >
          Browse by City
        </h2>

        {/* Country Selection */}
        <div className="mb-12 overflow-x-auto hide-scrollbar">
          <div className="flex gap-4 items-center min-w-max pb-2">
            {countries.map((country) => (
              <button
                key={country}
                onClick={() => setSelectedCountry(country)}
                className={`px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${
                  selectedCountry === country
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-900 hover:text-gray-700'
                }`}
              >
                {country}
              </button>
            ))}
          </div>
        </div>

        {/* City Columns */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {cities.map((city) => (
              <div key={city} className="flex flex-col">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">{city}</h3>
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li key={category}>
                      <a
                        href={`/${category.toLowerCase().replace(/\s+/g, '-')}-in-${city.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-gray-900 hover:text-gray-700 hover:underline transition-colors text-sm"
                      >
                        {category} in {city}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Scroll Button */}
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-gray-900" />
          </button>
        </div>
      </div>
    </section>
    </>
  );
}
