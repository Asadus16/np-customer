'use client';

import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location) params.set('location', location);
    router.push(`/vendors?${params.toString()}`);
  };

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Find the Perfect
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Service Provider
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Book trusted professionals for home cleaning, repairs, beauty services,
            and more. Quality service at your doorstep.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mt-10">
            <div className="bg-white rounded-full p-2 shadow-2xl flex flex-col md:flex-row items-center max-w-2xl mx-auto">
              {/* Service Search */}
              <div className="flex-1 flex items-center px-4 py-2 w-full md:w-auto">
                <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="What service do you need?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ml-3 flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-sm md:text-base"
                />
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px h-8 bg-gray-200" />

              {/* Location */}
              <div className="flex items-center px-4 py-2 w-full md:w-auto border-t md:border-t-0 border-gray-200">
                <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="ml-3 flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-sm md:text-base"
                />
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2 w-full md:w-auto justify-center mt-2 md:mt-0"
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* Popular Services */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="text-gray-400 text-sm">Popular:</span>
            {['Cleaning', 'Plumbing', 'Electrical', 'AC Repair', 'Beauty'].map((service) => (
              <button
                key={service}
                onClick={() => {
                  setSearchQuery(service);
                  router.push(`/vendors?q=${service}`);
                }}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-full transition-colors"
              >
                {service}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
