'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, X, ChevronLeft, ChevronRight, Calendar, Zap, Clock, Repeat } from 'lucide-react';
import { useVendor, useAuth } from '@/hooks';
import { BookingBreadcrumb, BookingLayout, BookingSidebar, ExitConfirmModal, LoginModal } from '@/components/booking';
import { getAvailableTimeSlots } from '@/lib/vendor';

type OrderType = 'now' | 'schedule' | 'recurring';
type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration: number;
  durationMax?: number;
  category: string;
  serviceCount?: number;
  gender?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function BookingTimePage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.vendorId as string;

  const { vendor, isLoading: vendorLoading, error: vendorError } = useVendor(vendorId);
  const { isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [weekStartDate, setWeekStartDate] = useState<Date>(() => new Date());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [orderType, setOrderType] = useState<OrderType | null>(null);
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>('weekly');
  const [showExitModal, setShowExitModal] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Load selected services from session storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedServices = sessionStorage.getItem(`booking_${vendorId}_services`);
      if (storedServices) {
        try {
          setSelectedServices(JSON.parse(storedServices));
        } catch (e) {
          console.error('Failed to parse stored services', e);
        }
      }
    }
  }, [vendorId]);

  // Map day of week (0-6) to day string
  const getDayString = (dayOfWeek: number): string => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayOfWeek];
  };

  // Check if vendor is currently open
  const isVendorCurrentlyOpen = useMemo(() => {
    if (!vendor?.company_hours || vendor.company_hours.length === 0) {
      return true; // Assume open if no hours data
    }

    const now = new Date();
    const dayOfWeek = now.getDay();
    const dayString = getDayString(dayOfWeek);
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const todayHours = vendor.company_hours.find((ch: any) => ch.day === dayString);

    if (!todayHours || !todayHours.is_available || !todayHours.slots || todayHours.slots.length === 0) {
      return false;
    }

    // Check if current time is within any slot
    for (const slot of todayHours.slots) {
      if (!slot.start_time || !slot.end_time) continue;

      const startTime = slot.start_time.substring(0, 5); // Get HH:mm
      const endTime = slot.end_time.substring(0, 5);

      if (currentTime >= startTime && currentTime <= endTime) {
        return true;
      }
    }

    return false;
  }, [vendor]);

  // Calculate total duration from selected services
  const totalDuration = useMemo(() => {
    return selectedServices.reduce((sum, service) => {
      return sum + (service.duration || 0);
    }, 0);
  }, [selectedServices]);

  // Generate basic time slots from company hours (without API check)
  const generateBasicTimeSlots = useCallback(() => {
    if (!vendor?.company_hours || vendor.company_hours.length === 0) {
      return [];
    }

    const dayOfWeek = selectedDate.getDay();
    const dayString = getDayString(dayOfWeek);
    const companyHour = vendor.company_hours.find((ch: any) => ch.day === dayString);

    if (!companyHour || !companyHour.is_available || !companyHour.slots || companyHour.slots.length === 0) {
      return [];
    }

    // Check if selected date is today
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    const currentMinutes = isToday ? now.getHours() * 60 + now.getMinutes() : 0;

    const slots: TimeSlot[] = [];

    companyHour.slots.forEach((slot: any) => {
      if (!slot.start_time || !slot.end_time) return;

      const [startHour, startMin] = slot.start_time.split(':').map(Number);
      const [endHour, endMin] = slot.end_time.split(':').map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      // Generate 10-minute intervals
      for (let minutes = startMinutes; minutes < endMinutes; minutes += 10) {
        // Skip past time slots if selected date is today
        if (isToday && minutes <= currentMinutes) {
          continue;
        }

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const timeString = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;

        slots.push({
          time: timeString,
          available: true,
        });
      }
    });

    return slots;
  }, [vendor, selectedDate]);

  // Fetch available time slots from API and update time slots
  useEffect(() => {
    if (!vendor || !selectedDate || selectedServices.length === 0) {
      const basicSlots = generateBasicTimeSlots();
      setTimeSlots(basicSlots);
      return;
    }

    // Only fetch availability for scheduled/recurring orders with duration > 0
    if (orderType !== 'schedule' && orderType !== 'recurring') {
      const basicSlots = generateBasicTimeSlots();
      setTimeSlots(basicSlots);
      return;
    }

    if (totalDuration <= 0) {
      const basicSlots = generateBasicTimeSlots();
      setTimeSlots(basicSlots);
      return;
    }

    const fetchAvailability = async () => {
      setLoadingSlots(true);
      try {
        const dateString = selectedDate.toISOString().split('T')[0];
        const response = await getAvailableTimeSlots(vendorId, dateString, totalDuration);
        
        // Generate all possible time slots first
        const allSlots = generateBasicTimeSlots();
        
        // Create a map of available times from API response
        // Normalize time format for comparison (backend returns "HH:MM", frontend uses "HH:MM:SS")
        const availableTimesMap = new Map<string, boolean>();
        response.data.forEach((slot) => {
          // Normalize backend time to match frontend format (add :00 if needed)
          const normalizedTime = slot.time.length === 5 ? `${slot.time}:00` : slot.time;
          availableTimesMap.set(normalizedTime, slot.available_count > 0);
        });

        // Update slots with availability from API
        const updatedSlots = allSlots.map((slot) => {
          // Check if this slot exists in the API response and has available technicians
          // If slot is not in the response, it means no technicians are available (all booked)
          const isAvailable = availableTimesMap.get(slot.time) ?? false;
          return {
            ...slot,
            available: isAvailable,
          };
        });

        setTimeSlots(updatedSlots);
      } catch (error: unknown) {
        console.error('Failed to fetch available time slots:', error);
        
        // If 401 (unauthorized), show login modal instead of redirecting
        // Check for axios error structure
        const axiosError = error as { 
          response?: { status?: number }; 
          status?: number;
          code?: string;
        };
        
        const is401Error = 
          axiosError?.response?.status === 401 || 
          axiosError?.status === 401;
        
        // If 401 error and user is not authenticated, just use basic slots
        // Don't show login modal here - it will show when they click Continue/Book
        if (is401Error && !isAuthenticated) {
          console.log('401 error detected for unauthenticated user, using basic slots');
          // Use basic slots so user can still see and select times
          const basicSlots = generateBasicTimeSlots();
          setTimeSlots(basicSlots);
          setLoadingSlots(false);
          return;
        }
        
        // Fallback to basic slots if API fails for other reasons
        const basicSlots = generateBasicTimeSlots();
        setTimeSlots(basicSlots);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailability();
  }, [vendor, selectedDate, orderType, totalDuration, vendorId, generateBasicTimeSlots, selectedServices.length, isAuthenticated]);

  // Calculate total
  const total = useMemo(() => {
    return selectedServices.reduce((sum, service) => {
      const price = typeof service.price === 'number' ? service.price : parseFloat(String(service.price || 0));
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
  }, [selectedServices]);

  // Get dates for the week view (7 days starting from weekStartDate)
  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate);
      date.setDate(weekStartDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [weekStartDate]);

  // Get month name for week view
  const weekMonthYear = useMemo(() => {
    const firstDate = weekDates[0];
    const lastDate = weekDates[weekDates.length - 1];
    const firstMonth = firstDate.toLocaleDateString('en-US', { month: 'long' });
    const lastMonth = lastDate.toLocaleDateString('en-US', { month: 'long' });
    const year = firstDate.getFullYear();

    if (firstMonth === lastMonth) {
      return `${firstMonth} ${year}`;
    }
    return `${firstMonth} - ${lastMonth} ${year}`;
  }, [weekDates]);

  // Format time for display (e.g., "9:00 am")
  const formatTime = (time: string): string => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Get day name (3 letters)
  const getDayName = (date: Date): string => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayNames[date.getDay()];
  };

  // Handle order type selection
  const handleOrderTypeSelect = (type: OrderType) => {
    setOrderType(type);

    if (type === 'now') {
      // For "Order Now", proceed immediately to confirm
      if (!isAuthenticated) {
        setShowLoginModal(true);
        return;
      }

      // Set current date and next available time
      const now = new Date();
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`booking_${vendorId}_date`, now.toISOString());
        sessionStorage.setItem(`booking_${vendorId}_time`, 'now');
        sessionStorage.setItem(`booking_${vendorId}_order_type`, 'now');
      }
      router.push(`/booking/${vendorId}/confirm`);
    }
  };

  // Handle continue
  const handleContinue = () => {
    // Validate required fields first
    if (orderType === 'schedule' && !selectedTime) return;
    if (orderType === 'recurring' && !selectedTime) return;

    // Check authentication - show login modal if not authenticated
    // Only show modal when user actually tries to book (clicks Continue)
    if (!isAuthenticated) {
      // Save current selections to session storage so they can be restored after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`booking_${vendorId}_date`, selectedDate.toISOString());
        sessionStorage.setItem(`booking_${vendorId}_time`, selectedTime || '');
        sessionStorage.setItem(`booking_${vendorId}_order_type`, orderType || 'schedule');
        if (orderType === 'recurring') {
          sessionStorage.setItem(`booking_${vendorId}_recurring_frequency`, recurringFrequency);
        }
      }
      setShowLoginModal(true);
      return;
    }

    // User is authenticated, proceed to confirm
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`booking_${vendorId}_date`, selectedDate.toISOString());
      sessionStorage.setItem(`booking_${vendorId}_time`, selectedTime || '');
      sessionStorage.setItem(`booking_${vendorId}_order_type`, orderType || 'schedule');
      if (orderType === 'recurring') {
        sessionStorage.setItem(`booking_${vendorId}_recurring_frequency`, recurringFrequency);
      }
    }
    router.push(`/booking/${vendorId}/confirm`);
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // Restore state from session storage if available
    if (typeof window !== 'undefined') {
      const storedDate = sessionStorage.getItem(`booking_${vendorId}_date`);
      const storedTime = sessionStorage.getItem(`booking_${vendorId}_time`);
      const storedOrderType = sessionStorage.getItem(`booking_${vendorId}_order_type`);
      
      if (storedDate) {
        setSelectedDate(new Date(storedDate));
      }
      if (storedTime) {
        setSelectedTime(storedTime);
      }
      if (storedOrderType) {
        setOrderType(storedOrderType as OrderType);
      }
      
      // If time is already selected, proceed to confirm
      const timeToUse = storedTime || selectedTime;
      if (timeToUse) {
        const dateToUse = storedDate ? new Date(storedDate) : selectedDate;
        sessionStorage.setItem(`booking_${vendorId}_date`, dateToUse.toISOString());
        sessionStorage.setItem(`booking_${vendorId}_time`, timeToUse);
        router.push(`/booking/${vendorId}/confirm`);
      }
      // Otherwise, stay on the page - the useEffect will re-fetch availability now that user is authenticated
    }
  };

  // Handle back - go to services page
  const handleBack = () => {
    router.push(`/booking/${vendorId}`);
  };

  // Handle close - show confirmation modal
  const handleClose = () => {
    setShowExitModal(true);
  };

  // Confirm exit
  const handleConfirmExit = () => {
    setShowExitModal(false);
    router.push(`/vendor/${vendorId}`);
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setShowCalendarModal(false);
  };

  // Navigate weeks with animation
  const handlePreviousWeek = () => {
    if (isAnimating) return;
    const newStart = new Date(weekStartDate);
    newStart.setDate(weekStartDate.getDate() - 7);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newStart >= today) {
      setSlideDirection('right');
      setIsAnimating(true);
      setTimeout(() => {
        setWeekStartDate(newStart);
        setSlideDirection(null);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleNextWeek = () => {
    if (isAnimating) return;
    const newStart = new Date(weekStartDate);
    newStart.setDate(weekStartDate.getDate() + 7);
    setSlideDirection('left');
    setIsAnimating(true);
    setTimeout(() => {
      setWeekStartDate(newStart);
      setSlideDirection(null);
      setIsAnimating(false);
    }, 200);
  };

  // Calendar modal - navigate months
  const handlePreviousMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  // Get calendar days for the modal
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - daysToSubtract);

    const days: Date[] = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [calendarMonth]);

  // Check if date is in past
  const isDateInPast = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  if (vendorLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (vendorError || !vendor) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-gray-600 mb-6">
            {vendorError?.message || 'Failed to load vendor information.'}
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white z-20">
        <div className="flex items-center justify-between pl-8 pr-6 lg:pl-12 lg:pr-10 pt-3 pb-3">
          <button
            onClick={handleBack}
            className="h-12 w-12 flex items-center justify-center border border-[#d3d3d3] rounded-full hover:bg-gray-50 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>

          <button
            onClick={handleClose}
            className="h-12 w-12 flex items-center justify-center border border-[#d3d3d3] rounded-full hover:bg-gray-50 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Breadcrumb */}
        <div className="mb-4">
          <BookingBreadcrumb currentStep="time" />
        </div>

        <BookingLayout
          sidebar={
            <BookingSidebar
              vendor={{ ...vendor, logo: vendor.logo ?? undefined }}
              selectedServices={selectedServices}
              total={total}
              onContinue={handleContinue}
              continueDisabled={!orderType || (orderType !== 'now' && !selectedTime)}
              showDurationRange={false}
            />
          }
        >
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Select time</h1>

            {/* Order Type Selection */}
            <div className="mb-8">
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => isVendorCurrentlyOpen && handleOrderTypeSelect('now')}
                  disabled={!isVendorCurrentlyOpen}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    !isVendorCurrentlyOpen
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                      : orderType === 'now'
                      ? 'border-[#6950f3] bg-[#6950f3]/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <Zap className={`h-6 w-6 mb-2 ${!isVendorCurrentlyOpen ? 'text-gray-400' : orderType === 'now' ? 'text-[#6950f3]' : 'text-gray-600'}`} />
                  <span className={`text-sm font-semibold ${!isVendorCurrentlyOpen ? 'text-gray-400' : orderType === 'now' ? 'text-[#6950f3]' : 'text-gray-900'}`}>
                    Order Now
                  </span>
                  <span className={`text-xs mt-1 ${!isVendorCurrentlyOpen ? 'text-red-500' : 'text-gray-500'}`}>
                    {isVendorCurrentlyOpen ? 'As soon as possible' : 'Vendor is closed'}
                  </span>
                </button>

                <button
                  onClick={() => handleOrderTypeSelect('schedule')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    orderType === 'schedule'
                      ? 'border-[#6950f3] bg-[#6950f3]/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <Clock className={`h-6 w-6 mb-2 ${orderType === 'schedule' ? 'text-[#6950f3]' : 'text-gray-600'}`} />
                  <span className={`text-sm font-semibold ${orderType === 'schedule' ? 'text-[#6950f3]' : 'text-gray-900'}`}>
                    Schedule
                  </span>
                  <span className="text-xs text-gray-500 mt-1">Pick date & time</span>
                </button>

                <button
                  onClick={() => handleOrderTypeSelect('recurring')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    orderType === 'recurring'
                      ? 'border-[#6950f3] bg-[#6950f3]/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <Repeat className={`h-6 w-6 mb-2 ${orderType === 'recurring' ? 'text-[#6950f3]' : 'text-gray-600'}`} />
                  <span className={`text-sm font-semibold ${orderType === 'recurring' ? 'text-[#6950f3]' : 'text-gray-900'}`}>
                    Recurring
                  </span>
                  <span className="text-xs text-gray-500 mt-1">Set frequency</span>
                </button>
              </div>
            </div>

            {/* Recurring Frequency Selection */}
            {orderType === 'recurring' && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select frequency</h2>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'daily', label: 'Daily' },
                    { id: 'weekly', label: 'Weekly' },
                    { id: 'biweekly', label: 'Bi-weekly' },
                    { id: 'monthly', label: 'Monthly' },
                  ].map((freq) => (
                    <button
                      key={freq.id}
                      onClick={() => setRecurringFrequency(freq.id as RecurringFrequency)}
                      className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                        recurringFrequency === freq.id
                          ? 'border-[#6950f3] bg-[#6950f3]/5 text-[#6950f3]'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Week View Date Selection - Show only when schedule or recurring is selected */}
            {(orderType === 'schedule' || orderType === 'recurring') && (
            <>
            <div className="mb-8">
              {/* Calendar Icon Button */}
              <button
                onClick={() => setShowCalendarModal(true)}
                className="h-12 w-12 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors mb-6"
                aria-label="Open calendar"
              >
                <Calendar className="h-5 w-5 text-gray-700" />
              </button>

              {/* Month/Year and Navigation */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {weekMonthYear}
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePreviousWeek}
                    className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Previous week"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-400" />
                  </button>
                  <button
                    onClick={handleNextWeek}
                    className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Next week"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Week Dates - Circular Buttons */}
              <div className="overflow-hidden">
                <div
                  className={`flex justify-between transition-all duration-200 ease-out ${
                    slideDirection === 'left'
                      ? 'opacity-0 -translate-x-4'
                      : slideDirection === 'right'
                      ? 'opacity-0 translate-x-4'
                      : 'opacity-100 translate-x-0'
                  }`}
                >
                  {weekDates.map((date) => {
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isPast = isDateInPast(date) && !isToday;

                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => !isPast && handleDateSelect(date)}
                        disabled={isPast}
                        className={`flex flex-col items-center ${isPast ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                            isPast
                              ? 'opacity-40 border border-gray-200'
                              : isSelected
                              ? 'bg-[#6950f3] text-white'
                              : 'border border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <span className={`text-2xl font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                            {date.getDate()}
                          </span>
                        </div>
                        <span className={`text-sm mt-2 ${
                          isPast ? 'text-gray-400' : isSelected ? 'text-gray-900 font-medium' : 'text-gray-500'
                        }`}>
                          {getDayName(date)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Available Time Slots */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Available times</h2>
              {timeSlots.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {timeSlots.map((slot, index) => {
                    const isSelected = selectedTime === slot.time;

                    return (
                      <button
                        key={index}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`py-4 px-5 rounded-lg text-base font-medium transition-all text-left ${
                          isSelected
                            ? 'bg-gray-100 text-gray-900 border-2 border-[#6950f3] cursor-pointer'
                            : slot.available
                            ? 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300 cursor-pointer'
                            : 'bg-gray-50 border border-gray-100 text-gray-300 cursor-not-allowed opacity-60'
                        }`}
                      >
                        {formatTime(slot.time)}
                        {!slot.available && <span className="ml-2 text-xs">(Unavailable)</span>}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No time slots available for this date.</p>
                </div>
              )}
            </div>

            {/* Waitlist Link */}
            {timeSlots.length > 0 && (
              <div className="mt-6 text-center">
                <button
                  className="text-sm font-medium hover:opacity-80 transition-opacity"
                  style={{ color: '#6950f3' }}
                >
                  Can&apos;t find a suitable time? Join waitlist
                </button>
              </div>
            )}
            </>
            )}
        </BookingLayout>
      </div>

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePreviousMonth}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              <h3 className="text-lg font-semibold text-gray-900">
                {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={handleNextMonth}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                const isCurrentMonth = date.getMonth() === calendarMonth.getMonth();
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const isToday = date.toDateString() === new Date().toDateString();
                const isPast = isDateInPast(date) && !isToday;

                return (
                  <button
                    key={index}
                    onClick={() => !isPast && isCurrentMonth && handleDateSelect(date)}
                    disabled={isPast || !isCurrentMonth}
                    className={`h-10 w-10 flex items-center justify-center rounded-full text-sm transition-all mx-auto ${
                      isSelected
                        ? 'text-white font-semibold'
                        : isToday && isCurrentMonth
                        ? 'border-2 font-semibold'
                        : !isCurrentMonth
                        ? 'text-gray-300'
                        : isPast
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                    style={
                      isSelected
                        ? { backgroundColor: '#6950f3' }
                        : isToday && isCurrentMonth
                        ? { borderColor: '#6950f3', color: '#6950f3' }
                        : undefined
                    }
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowCalendarModal(false)}
              className="mt-6 w-full py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Exit Confirmation Modal */}
      <ExitConfirmModal
        isOpen={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirm={handleConfirmExit}
      />
    </div>
  );
}
