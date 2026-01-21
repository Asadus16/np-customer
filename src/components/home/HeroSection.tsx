'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Calendar, Smartphone, Grid3x3, Sparkles, Scissors, Droplets, Eye, Smile, Home, Briefcase, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const categories = [
  { id: 'all', name: 'All treatments', icon: Grid3x3 },
  { id: 'hair', name: 'Hair & styling', icon: Scissors },
  { id: 'nails', name: 'Nails', icon: Sparkles },
  { id: 'hair-removal', name: 'Hair removal', icon: Droplets },
  { id: 'eyebrows', name: 'Eyebrows & eyelashes', icon: Eye },
  { id: 'facials', name: 'Facials & skincare', icon: Smile },
];

export function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [count, setCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('any');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const targetCount = 427212;

  // Mock data for saved and recent locations
  const savedLocations = [
    { id: 'home', name: 'Add Home', icon: Home, address: '' },
    { id: 'work', name: 'Add Work', icon: Briefcase, address: '' },
  ];

  const recentLocations = [
    { id: '1', name: 'D.H.A. Phase 2', address: 'Phase 2 Defence Housing Authority, Karachi, Pakistan' },
    { id: '2', name: 'DHA Phase 5', address: 'Lahore, Pakistan' },
  ];

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close search dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }

      // Close location dropdown
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node) &&
        locationInputRef.current &&
        !locationInputRef.current.contains(event.target as Node)
      ) {
        setShowLocationDropdown(false);
      }

      // Close date dropdown
      if (
        dateDropdownRef.current &&
        !dateDropdownRef.current.contains(event.target as Node) &&
        dateInputRef.current &&
        !dateInputRef.current.contains(event.target as Node)
      ) {
        setShowDateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location) params.set('location', location);
    if (date) params.set('date', date);
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
    router.push(`/vendors?${params.toString()}`);
  };

  const handleCategorySelect = (categoryId: string, categoryName: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery(categoryId === 'all' ? '' : categoryName);
    setShowDropdown(false);
  };

  const handleLocationSelect = (locationName: string, address?: string) => {
    setLocation(locationName);
    setShowLocationDropdown(false);
  };

  const handleClearRecent = () => {
    // Clear recent locations logic here
    setShowLocationDropdown(false);
  };

  // Date picker functions
  const getToday = () => new Date();
  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const formatDate = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const formatDateShort = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setDate(formatDate(date));
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (time === 'any') {
      setDate('Any time');
    } else {
      const timeLabels: { [key: string]: string } = {
        morning: 'Morning (9 am - 12 pm)',
        afternoon: 'Afternoon (12 pm - 5 pm)',
        evening: 'Evening (7 pm - 11 pm)',
        custom: 'Custom time'
      };
      setDate(timeLabels[time] || 'Any time');
    }
    setShowDateDropdown(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = getToday();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <section className="relative">
      <div className="relative max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24" style={{ zIndex: 1 }}>
        <div className="text-center max-w-[80%] mx-auto mt-[30px] pt-[60px] ">
          <h1 
            style={{
              fontFamily: 'RoobertPRO, AktivGroteskVF, sans-serif',
              fontStyle: 'normal',
              fontWeight: 700,
              color: 'rgb(20, 20, 20)',
              fontSize: '64px',
              lineHeight: '68px'
            }}
          >
            Book local selfcare services
          </h1>
          <p 
            className="mt-4 mx-auto"
            style={{ 
              fontFamily: 'RoobertPRO, AktivGroteskVF, sans-serif',
              fontStyle: 'normal',
              fontWeight: 400,
              color: 'rgb(20, 20, 20)',
              fontSize: '20px',
              lineHeight: '28px'
            }}
          >
            Discover top-rated salons, barbers, medspas, wellness studios and beauty experts trusted by millions worldwide
          </p>

          {/* Search Form */}
      <form onSubmit={handleSearch} className="mt-12  mx-auto relative z-[100]">
            <div className="py-0.5 bg-white rounded-[50px] border border-purple-200 flex flex-col md:flex-row items-center rounded-4xl border-6 relative focus-within:border-purple-200 focus-within:ring-0">
              {/* Service Search - 4 columns (3x4=12) */}
              <div className="w-full md:w-4/12 flex items-center p-[21px] border-b md:border-b-0 hover:bg-[#F2F2F2] ml-[1px] hover:rounded-full relative md:after:content-[''] md:after:absolute md:after:right-0 md:after:top-1/2 md:after:-translate-y-1/2 md:after:h-[60%] md:after:w-px md:after:bg-gray-200 md:hover:after:hidden">
                <Search className="h-5 w-5 text-gray-900 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="All treatments and venues"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  className="ml-3 flex-1 bg-transparent border-none outline-none text-gray-900 text-[15px] leading-[15px] font-medium placeholder:text-[rgb(20,20,20)] focus:outline-none focus:ring-0 focus:border-none"
                  style={{ fontFamily: 'RoobertPRO, AktivGroteskVF, sans-serif' }}
                />
                
                {/* Dropdown Menu */}
                {showDropdown && (
                  <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-[9999] max-h-[400px] overflow-y-auto dropdown-scrollbar h-[235px]"
                    style={{ 
                      fontFamily: 'RoobertPRO, AktivGroteskVF, sans-serif',
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#d1d5db #f3f4f6'
                    }}
                  >
                    {/* All treatments option */}
                    <button
                      type="button"
                      onClick={() => handleCategorySelect('all', '')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                    >
                      <Grid3x3 className="h-5 w-5 text-gray-600 flex-shrink-0" />
                      <span className="text-[15px] font-medium text-gray-900">All treatments</span>
                    </button>

                    {/* Top categories heading */}
                    <div className="px-4 py-2 border-t border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Top categories</h3>
                    </div>

                    {/* Category list */}
                    {categories.filter(cat => cat.id !== 'all').map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => handleCategorySelect(category.id, category.name)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                        >
                          <IconComponent className="h-5 w-5 text-gray-600 flex-shrink-0" />
                          <span className="text-[15px] font-normal text-gray-900">{category.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Location - 4 columns (3x4=12) */}
              <div className="w-full md:w-4/12 flex items-center p-[21px] border-b md:border-b-0 hover:bg-[#F2F2F2] ml-[1px] hover:rounded-full relative md:after:content-[''] md:after:absolute md:after:right-0 md:after:top-1/2 md:after:-translate-y-1/2 md:after:h-[60%] md:after:w-px md:after:bg-gray-200 md:hover:after:hidden">
                <MapPin className="h-5 w-5 text-gray-900 flex-shrink-0" />
                <input
                  ref={locationInputRef}
                  type="text"
                  placeholder="Current location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onFocus={() => setShowLocationDropdown(true)}
                  className="ml-3 flex-1 bg-transparent border-none outline-none text-gray-900 text-[15px] leading-[15px] font-medium placeholder:text-[rgb(20,20,20)] focus:outline-none focus:ring-0 focus:border-none"
                  style={{ fontFamily: 'RoobertPRO, AktivGroteskVF, sans-serif' }}
                />
                {location && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation('');
                    }}
                    className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                )}

                {/* Location Dropdown Menu */}
                {showLocationDropdown && (
                  <div
                    ref={locationDropdownRef}
                    className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-[9999] max-h-[230px] overflow-y-auto dropdown-scrollbar"
                    style={{ 
                      fontFamily: 'RoobertPRO, AktivGroteskVF, sans-serif',
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#d1d5db #f3f4f6'
                    }}
                  >
                    {/* Current location option */}
                    <button
                      type="button"
                      onClick={() => handleLocationSelect('Current location')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                    >
                      <ChevronRight className="h-5 w-5 text-purple-600 flex-shrink-0" />
                      <span className="text-[15px] font-normal text-gray-900">Current location</span>
                    </button>

                    {/* Saved section */}
                    <div className="border-t border-gray-100">
                      <div className="flex items-center justify-between px-4 py-2">
                        <h3 className="text-sm font-semibold text-gray-900">Saved</h3>
                        <button
                          type="button"
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Manage
                        </button>
                      </div>
                      {savedLocations.map((saved) => {
                        const IconComponent = saved.icon;
                        return (
                          <button
                            key={saved.id}
                            type="button"
                            onClick={() => handleLocationSelect(saved.name)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                          >
                            <IconComponent className="h-5 w-5 text-gray-600 flex-shrink-0" />
                            <span className="text-[15px] font-normal text-gray-900">{saved.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Recent section */}
                    <div className="border-t border-gray-100">
                      <div className="flex items-center justify-between px-4 py-2">
                        <h3 className="text-sm font-semibold text-gray-900">Recent</h3>
                        <button
                          type="button"
                          onClick={handleClearRecent}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Clear
                        </button>
                      </div>
                      {recentLocations.map((recent) => (
                        <button
                          key={recent.id}
                          type="button"
                          onClick={() => handleLocationSelect(recent.name, recent.address)}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                        >
                          <MapPin className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-[15px] font-normal text-gray-900">{recent.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{recent.address}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Date - 4 columns (3x4=12) */}
              <div className="w-full md:w-4/12 flex items-center p-[21px] hover:bg-[#F2F2F2] ml-[1px] hover:rounded-full relative">
                <Calendar className="h-5 w-5 text-gray-900 flex-shrink-0" />
                <input
                  ref={dateInputRef}
                  type="text"
                  placeholder="Any time"
                  value={date}
                  readOnly
                  onFocus={() => setShowDateDropdown(true)}
                  className="ml-3 flex-1 bg-transparent border-none outline-none text-gray-900 text-[15px] leading-[15px] font-medium placeholder:text-[rgb(20,20,20)] cursor-pointer focus:outline-none focus:ring-0 focus:border-none"
                  style={{ fontFamily: 'RoobertPRO, AktivGroteskVF, sans-serif' }}
                />

                {/* Date and Time Picker Dropdown */}
                {showDateDropdown && (
                  <div
                    ref={dateDropdownRef}
                    className="absolute top-full left-0 mt-2 w-[600px] bg-white rounded-lg shadow-lg border border-gray-200 z-[9999] p-4"
                    style={{ fontFamily: 'RoobertPRO, AktivGroteskVF, sans-serif' }}
                  >
                    <div className="flex gap-4">
                      {/* Left Panel - Quick Date Selectors */}
                      <div className="flex flex-col gap-2 w-32">
                        <button
                          type="button"
                          onClick={() => handleDateSelect(getToday())}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            isSelected(getToday()) 
                              ? 'border-gray-300 bg-gray-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-sm font-semibold text-gray-900">Today</div>
                          <div className="text-xs text-gray-600 mt-1">{formatDate(getToday())}</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDateSelect(getTomorrow())}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            isSelected(getTomorrow()) 
                              ? 'border-gray-300 bg-gray-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-sm font-semibold text-gray-900">Tomorrow</div>
                          <div className="text-xs text-gray-600 mt-1">{formatDate(getTomorrow())}</div>
                        </button>
                      </div>

                      {/* Right Panel - Calendar */}
                      <div className="flex-1">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-4">
                          <button
                            type="button"
                            onClick={() => navigateMonth('prev')}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <ChevronLeft className="h-5 w-5 text-gray-600" />
                          </button>
                          <h3 className="text-base font-semibold text-gray-900">
                            {currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).replace(',', '')}
                          </h3>
                          <button
                            type="button"
                            onClick={() => navigateMonth('next')}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <ChevronRight className="h-5 w-5 text-gray-600" />
                          </button>
                        </div>

                        {/* Days of Week */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                            <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                          {getDaysInMonth(currentMonth).map((day, index) => {
                            if (!day) {
                              return <div key={`empty-${index}`} className="aspect-square" />;
                            }
                            const isDayToday = isToday(day);
                            const isDaySelected = isSelected(day);
                            return (
                              <button
                                key={day.toISOString()}
                                type="button"
                                onClick={() => handleDateSelect(day)}
                                className={`aspect-square flex items-center justify-center text-sm rounded transition-colors ${
                                  isDaySelected
                                    ? 'bg-gray-200 text-gray-900 font-semibold'
                                    : isDayToday
                                    ? 'bg-gray-100 text-gray-900 font-medium'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                                style={{
                                  minWidth: '36px',
                                  minHeight: '36px'
                                }}
                              >
                                {day.getDate()}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Time Selectors */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-semibold text-gray-900">Select time</label>
                        <div className="flex gap-2 flex-wrap">
                          {[
                            { id: 'any', label: 'Any time' },
                            { id: 'morning', label: 'Morning', subtitle: '9 am - 12 pm' },
                            { id: 'afternoon', label: 'Afternoon', subtitle: '12 pm - 5 pm' },
                            { id: 'evening', label: 'Evening', subtitle: '7 pm - 11 pm' },
                            { id: 'custom', label: 'Custom' },
                          ].map((timeOption) => (
                            <button
                              key={timeOption.id}
                              type="button"
                              onClick={() => handleTimeSelect(timeOption.id)}
                              className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                                selectedTime === timeOption.id
                                  ? 'border-gray-300 bg-gray-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              } ${timeOption.id === 'morning' || timeOption.id === 'afternoon' ? 'opacity-50 cursor-not-allowed' : ''}`}
                              disabled={timeOption.id === 'morning' || timeOption.id === 'afternoon'}
                            >
                              <div className="text-gray-900 font-medium">{timeOption.label}</div>
                              {timeOption.subtitle && (
                                <div className="text-xs text-gray-500 mt-0.5">{timeOption.subtitle}</div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Search Button - integrated on the right */}
              <div className="w-full md:w-auto flex items-center justify-center md:justify-end px-2 py-2 md:py-1">
                <button
                  type="submit"
                  className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-3.5 rounded-full font-bold transition-colors w-full md:w-auto"
                >
                  Search
                </button>
              </div>
            </div>
          </form>    

          {/* Appointment Count - dark pink/purple color */}
          <div className="mt-7">
            <p className="text-lg font-bold animate-fade-in">
              {count.toLocaleString()} appointments booked today
            </p>
          </div>

          {/* Get the app button - white with border */}
          <div className="mt-10 relative inline-block group">
            <button className="bg-white border border-gray-300 hover:border-gray-400 text-gray-900 px-6 py-3 rounded-[50px] font-bold transition-colors flex items-center gap-2 mx-auto">
              {/* Apps/Grid icon - 2x3 grid */}
             
              <span>Get the app</span>
               <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="2" width="6" height="6" />
                <rect x="10" y="2" width="6" height="6" />
                <rect x="2" y="10" width="6" height="6" />
                <rect x="10" y="10" width="6" height="6" />
                <rect x="2" y="18" width="6" height="6" />
                <rect x="10" y="18" width="6" height="6" />
              </svg>
            </button>
            
            {/* QR Code Card - appears on hover */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none">
              <div className="bg-white rounded-2xl p-4 shadow-2xl">
                {/* QR Code */}
                <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center mb-3 mx-auto">
                  {/* QR Code SVG - replace with actual QR code image if available */}
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <rect width="100" height="100" fill="white" />
                    {/* Top left corner finder pattern */}
                    <rect x="10" y="10" width="20" height="20" fill="black" />
                    <rect x="12" y="12" width="16" height="16" fill="white" />
                    <rect x="14" y="14" width="12" height="12" fill="black" />
                    {/* Top right corner finder pattern */}
                    <rect x="70" y="10" width="20" height="20" fill="black" />
                    <rect x="72" y="12" width="16" height="16" fill="white" />
                    <rect x="74" y="14" width="12" height="12" fill="black" />
                    {/* Bottom left corner finder pattern */}
                    <rect x="10" y="70" width="20" height="20" fill="black" />
                    <rect x="12" y="72" width="16" height="16" fill="white" />
                    <rect x="14" y="74" width="12" height="12" fill="black" />
                    {/* Data modules - simplified pattern */}
                    <rect x="35" y="10" width="2" height="2" fill="black" />
                    <rect x="40" y="10" width="2" height="2" fill="black" />
                    <rect x="50" y="10" width="2" height="2" fill="black" />
                    <rect x="58" y="10" width="2" height="2" fill="black" />
                    <rect x="10" y="35" width="2" height="2" fill="black" />
                    <rect x="20" y="35" width="2" height="2" fill="black" />
                    <rect x="30" y="35" width="2" height="2" fill="black" />
                    <rect x="45" y="35" width="2" height="2" fill="black" />
                    <rect x="55" y="35" width="2" height="2" fill="black" />
                    <rect x="70" y="35" width="2" height="2" fill="black" />
                    <rect x="80" y="35" width="2" height="2" fill="black" />
                    <rect x="35" y="45" width="2" height="2" fill="black" />
                    <rect x="50" y="45" width="2" height="2" fill="black" />
                    <rect x="65" y="45" width="2" height="2" fill="black" />
                    <rect x="35" y="55" width="2" height="2" fill="black" />
                    <rect x="45" y="55" width="2" height="2" fill="black" />
                    <rect x="60" y="55" width="2" height="2" fill="black" />
                    <rect x="75" y="55" width="2" height="2" fill="black" />
                    <rect x="10" y="60" width="2" height="2" fill="black" />
                    <rect x="25" y="60" width="2" height="2" fill="black" />
                    <rect x="40" y="60" width="2" height="2" fill="black" />
                    <rect x="55" y="60" width="2" height="2" fill="black" />
                    <rect x="70" y="60" width="2" height="2" fill="black" />
                    <rect x="85" y="60" width="2" height="2" fill="black" />
                    <rect x="35" y="70" width="2" height="2" fill="black" />
                    <rect x="50" y="70" width="2" height="2" fill="black" />
                    <rect x="65" y="70" width="2" height="2" fill="black" />
                    <rect x="35" y="80" width="2" height="2" fill="black" />
                    <rect x="50" y="80" width="2" height="2" fill="black" />
                    <rect x="70" y="80" width="2" height="2" fill="black" />
                    <rect x="85" y="80" width="2" height="2" fill="black" />
                    <rect x="10" y="85" width="2" height="2" fill="black" />
                    <rect x="25" y="85" width="2" height="2" fill="black" />
                    <rect x="40" y="85" width="2" height="2" fill="black" />
                    <rect x="55" y="85" width="2" height="2" fill="black" />
                    <rect x="70" y="85" width="2" height="2" fill="black" />
                    <rect x="85" y="85" width="2" height="2" fill="black" />
                  </svg>
                </div>
                {/* Text */}
                <p className="text-center text-black text-xs font-normal">Scan to download</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
