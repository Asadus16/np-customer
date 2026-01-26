'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, MapPin, Calendar, Grid3x3, Scissors, Sparkles, Droplets, Eye, Smile, Home, Briefcase, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const categories = [
  { id: 'all', name: 'All treatments', icon: Grid3x3 },
  { id: 'hair', name: 'Hair & styling', icon: Scissors },
  { id: 'nails', name: 'Nails', icon: Sparkles },
  { id: 'hair-removal', name: 'Hair removal', icon: Droplets },
  { id: 'eyebrows', name: 'Eyebrows & eyelashes', icon: Eye },
  { id: 'facials', name: 'Facials & skincare', icon: Smile },
];

interface SearchBarProps {
  className?: string;
  onExpandChange?: (expanded: boolean) => void;
}

export function SearchBar({ className = '', onExpandChange }: SearchBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'search' | 'location' | 'date' | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('any');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLFormElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Track mounted state for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Notify parent of expand state changes
  useEffect(() => {
    onExpandChange?.(isExpanded);
  }, [isExpanded, onExpandChange]);

  // Mock data for saved and recent locations
  const savedLocations = [
    { id: 'address', name: 'Address', emoji: '😊', address: 'Lahore, Pakistan' },
  ];

  const recentLocations = [
    { id: '1', name: 'D.H.A. Phase 2', address: 'Phase 2 Defence Housing Authority, Karachi, Pakistan' },
    { id: '2', name: 'DHA Phase 5', address: 'Lahore, Pakistan' },
  ];

  // Close everything when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setActiveSection(null);
        setShowDropdown(false);
        setShowLocationDropdown(false);
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
    setIsExpanded(false);
  };

  const handleCategorySelect = (categoryId: string, categoryName: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery(categoryId === 'all' ? '' : categoryName);
    setShowDropdown(false);
  };

  const handleLocationSelect = (locationName: string) => {
    setLocation(locationName);
    setShowLocationDropdown(false);
  };

  const handleClearRecent = () => {
    setShowLocationDropdown(false);
  };

  const handleFieldClick = (field: 'search' | 'location' | 'date') => {
    setIsExpanded(true);
    setActiveSection(field);
    setShowDropdown(field === 'search');
    setShowLocationDropdown(field === 'location');
    setShowDateDropdown(field === 'date');
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
        evening: 'Evening (6 pm - 11 pm)',
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
    // Adjust for Monday start (0 = Monday, 6 = Sunday)
    const adjustedStartDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    for (let i = 0; i < adjustedStartDay; i++) {
      days.push(null);
    }
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

  const formatMonthYear = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Backdrop overlay rendered via portal to escape header's stacking context
  const backdropOverlay = mounted && isExpanded && createPortal(
    <div
      className="fixed inset-0 bg-black/40 transition-all duration-300"
      style={{ zIndex: 40, top: '88px' }}
      onClick={() => {
        setIsExpanded(false);
        setActiveSection(null);
        setShowDropdown(false);
        setShowLocationDropdown(false);
        setShowDateDropdown(false);
      }}
    />,
    document.body
  );

  return (
    <>
      {backdropOverlay}
      {/* Wrapper maintains original width in layout */}
      <div
        className={`relative transition-all duration-300 ease-in-out ${className}`}
        style={{ zIndex: 50 }}
      >
        <form
          ref={containerRef}
          onSubmit={handleSearch}
          className={`transition-all duration-300 ease-in-out ${
            isExpanded ? 'absolute -left-16 top-1/2 -translate-y-1/2 w-[920px]' : 'w-full'
          }`}
        >
        <div
          className={`rounded-full border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out flex items-center ${
            isExpanded ? 'bg-gray-100' : 'bg-white'
          }`}
        >
        {/* Service Search */}
        <div
          className={`flex-1 flex flex-col justify-center px-5 relative transition-all duration-300 cursor-pointer ${
            isExpanded ? 'py-2' : 'py-3'
          } ${
            isExpanded && activeSection === 'search'
              ? 'bg-white rounded-full shadow-lg'
              : isExpanded
              ? 'hover:bg-gray-200/60 rounded-l-full'
              : 'hover:bg-gray-50 rounded-l-full'
          }`}
          onClick={() => handleFieldClick('search')}
        >
          {/* Label - only visible when expanded */}
          <span
            className={`text-xs font-medium text-gray-800 transition-all duration-300 ${
              isExpanded ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden'
            }`}
          >
            Treatment or venue
          </span>
          <div className="flex items-center">
            {!isExpanded && <Search className="h-4 w-4 text-gray-900 flex-shrink-0 mr-2" />}
            <input
              ref={inputRef}
              type="text"
              placeholder="All treatments"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => handleFieldClick('search')}
              className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium focus:outline-none focus:ring-0 min-w-0 cursor-pointer text-gray-900 placeholder:text-gray-500"
              style={{ fontFamily: 'RoobertPRO, AktivGroteskVF, sans-serif' }}
            />
          </div>

          {/* Search Dropdown */}
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-[9999] max-h-[300px] overflow-y-auto"
              style={{ fontFamily: 'RoobertPRO, AktivGroteskVF, sans-serif' }}
            >
              <button
                type="button"
                onClick={() => handleCategorySelect('all', '')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
              >
                <Grid3x3 className="h-5 w-5 text-gray-600 flex-shrink-0" />
                <span className="text-[15px] font-medium text-gray-900">All treatments</span>
              </button>

              <div className="px-4 py-2 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Top categories</h3>
              </div>

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

        {/* Divider */}
        {!isExpanded && <div className="w-px h-6 bg-gray-200 shrink-0" />}

        {/* Location */}
        <div
          className={`flex-1 flex flex-col justify-center px-5 relative transition-all duration-300 cursor-pointer ${
            isExpanded ? 'py-2' : 'py-3'
          } ${
            isExpanded && activeSection === 'location'
              ? 'bg-white rounded-full shadow-lg'
              : isExpanded
              ? 'hover:bg-gray-200/60'
              : 'hover:bg-gray-50'
          }`}
          onClick={() => handleFieldClick('location')}
        >
          {/* Label - only visible when expanded */}
          <span
            className={`text-xs font-medium text-gray-800 transition-all duration-300 ${
              isExpanded ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden'
            }`}
          >
            Location
          </span>
          <div className="flex items-center">
            <span
              className="flex-1 text-[15px] font-medium truncate text-gray-900"
              style={{ fontFamily: 'RoobertPRO, AktivGroteskVF, sans-serif' }}
            >
              {location || 'Current location'}
            </span>
            {location && isExpanded && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocation('');
                }}
                className="ml-1 p-0.5 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="h-3 w-3 text-gray-500" />
              </button>
            )}
          </div>

          {/* Location Dropdown */}
          {showLocationDropdown && (
            <div
              ref={locationDropdownRef}
              className="absolute top-full left-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9999] overflow-hidden"
              style={{ fontFamily: 'RoobertPRO, AktivGroteskVF, sans-serif' }}
            >
              <button
                type="button"
                onClick={() => handleLocationSelect('Current location')}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 text-left transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <ChevronRight className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-[15px] font-medium text-gray-900">Current location</span>
              </button>

              <div className="border-t border-gray-100">
                <div className="flex items-center justify-between px-5 py-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Saved</h3>
                  <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Manage
                  </button>
                </div>
                {savedLocations.map((saved) => (
                  <button
                    key={saved.id}
                    type="button"
                    onClick={() => handleLocationSelect(saved.name)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 text-left transition-colors"
                  >
                    <span className="text-xl flex-shrink-0">{saved.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium text-gray-900">{saved.name}</p>
                      {saved.address && (
                        <p className="text-sm text-gray-500 truncate">{saved.address}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        {!isExpanded && <div className="w-px h-6 bg-gray-200 shrink-0" />}

        {/* Date/Time */}
        <div
          className={`flex-1 flex flex-col justify-center px-5 relative transition-all duration-300 cursor-pointer ${
            isExpanded ? 'py-2' : 'py-3'
          } ${
            isExpanded && activeSection === 'date'
              ? 'bg-white rounded-full shadow-lg'
              : isExpanded
              ? 'hover:bg-gray-200/60 rounded-r-full'
              : 'hover:bg-gray-50 rounded-r-full'
          }`}
          onClick={() => handleFieldClick('date')}
        >
          {/* Label - only visible when expanded */}
          <span
            className={`text-xs font-medium text-gray-800 transition-all duration-300 ${
              isExpanded ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden'
            }`}
          >
            Time
          </span>
          <div className="flex items-center">
            <span
              className="flex-1 text-[15px] font-medium truncate text-gray-900"
              style={{ fontFamily: 'RoobertPRO, AktivGroteskVF, sans-serif' }}
            >
              {date || 'Any time'}
            </span>
          </div>

          {/* Date Dropdown */}
          {showDateDropdown && (
            <div
              ref={dateDropdownRef}
              className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-[9999] p-5"
              style={{ fontFamily: 'RoobertPRO, AktivGroteskVF, sans-serif', width: '520px' }}
            >
              <div className="flex gap-4">
                {/* Quick Date Selectors */}
                <div className="flex flex-col gap-3 w-32">
                  <button
                    type="button"
                    onClick={() => handleDateSelect(getToday())}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      isSelected(getToday())
                        ? 'border-gray-400 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-semibold text-gray-900">Today</div>
                    <div className="text-xs text-gray-500 mt-1">{formatDate(getToday())}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDateSelect(getTomorrow())}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      isSelected(getTomorrow())
                        ? 'border-gray-400 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-semibold text-gray-900">Tomorrow</div>
                    <div className="text-xs text-gray-500 mt-1">{formatDate(getTomorrow())}</div>
                  </button>
                </div>

                {/* Calendar */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={() => navigateMonth('prev')}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <h3 className="text-base font-semibold text-gray-900">
                      {formatMonthYear(currentMonth)}
                    </h3>
                    <button
                      type="button"
                      onClick={() => navigateMonth('next')}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

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
                          className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-colors ${
                            isDaySelected
                              ? 'bg-gray-900 text-white font-semibold'
                              : isDayToday
                              ? 'bg-gray-100 text-gray-900 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Time Selectors */}
              <div className="mt-5 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">Select time</span>
                  <div className="flex gap-2 flex-wrap flex-1">
                    {[
                      { id: 'any', label: 'Any time', subtitle: '' },
                      { id: 'morning', label: 'Morning', subtitle: '9 am - 12 pm' },
                      { id: 'afternoon', label: 'Afternoon', subtitle: '12 pm - 5 pm' },
                      { id: 'evening', label: 'Evening', subtitle: '6 pm - 11 pm' },
                      { id: 'custom', label: 'Custom', subtitle: '' },
                    ].map((timeOption) => (
                      <button
                        key={timeOption.id}
                        type="button"
                        onClick={() => handleTimeSelect(timeOption.id)}
                        className={`px-4 py-2 rounded-xl border text-sm transition-colors ${
                          selectedTime === timeOption.id
                            ? 'border-gray-400 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-gray-900 font-medium">{timeOption.label}</div>
                        {timeOption.subtitle && (
                          <div className="text-xs text-gray-500">{timeOption.subtitle}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Button - only visible when expanded */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded ? 'w-auto opacity-100 pl-3 pr-2' : 'w-0 opacity-0 px-0'
          }`}
        >
          <button
            type="submit"
            className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-full font-semibold transition-colors text-sm whitespace-nowrap"
          >
            Search
          </button>
        </div>
      </div>
    </form>
      </div>
    </>
  );
}
