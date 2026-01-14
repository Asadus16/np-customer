'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [count, setCount] = useState(0);
  const targetCount = 427212;

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = targetCount / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const newCount = Math.min(Math.floor(increment * currentStep), targetCount);
      setCount(newCount);
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setCount(targetCount);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location) params.set('location', location);
    if (date) params.set('date', date);
    router.push(`/vendors?${params.toString()}`);
  };

  return (
    <section className="relative bg-white overflow-hidden">
      {/* Animated rotating gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="animate-gradient-rotate" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Book local selfcare services
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            Discover top-rated salons, barbers, medspas, wellness studios and beauty experts trusted by millions worldwide
          </p>

          {/* Search Form */}
      <form onSubmit={handleSearch} className="mt-10">
            <div className="bg-white rounded-2xl border border-purple-200 flex flex-col md:flex-row items-center mx-auto rounded-4xl border-6">
              {/* Service Search */}
              <div className="col-2 flex items-center px-4 py-3 w-full md:w-auto border-r-0 md:border-r border-gray-200">
                <Search className="h-5 w-5 text-gray-900 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="All treatments and venues"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ml-3 flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-600 text-[15px]"
                />
              </div>

              {/* Location */}
              <div className="col-2 flex items-center px-4 py-3 w-full md:w-auto border-t md:border-t-0 border-r-0 md:border-r border-gray-200">
                <MapPin className="h-5 w-5 text-gray-900 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Current location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="ml-3 flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-600 text-[15px]"
                />
              </div>

              {/* Date */}
              <div className="col-2 flex items-center px-4 py-3 w-full md:w-auto border-t md:border-t-0 border-r-0 ">
                <Calendar className="h-5 w-5 text-gray-900 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Any time"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="ml-3 flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-600 text-[15px]"
                />
              </div>

              {/* Search Button */}
              <div className="col-2 flex items-center py-1 w-full md:w-auto">
              <button
                type="submit"
                className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-full font-bold transition-colors flex items-center justify-center w-full md:w-auto mt-2 md:mt-0 mx-2 md:mx-2"
              >
                Search
              </button>
              </div>
            </div>
          </form>    

          {/* Appointment Count - dark pink/purple color */}
          <div className="mt-6">
            <p className="text-lg font-bold animate-fade-in">
              {count.toLocaleString()} appointments booked today
            </p>
          </div>

          {/* Get the app button - light gray */}
          <div className="mt-6">
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto">
              <Smartphone className="h-5 w-5" />
              <span>Get the app</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
