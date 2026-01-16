'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, X, ChevronLeft, ChevronRight, Calendar, Zap, Clock, Repeat } from 'lucide-react';
import { useVendor, useAuth } from '@/hooks';
import { BookingBreadcrumb, BookingSidebar, LoginModal } from '@/components/booking';

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

  // Generate time slots based on company hours (10-minute intervals)
  useEffect(() => {
    if (!vendor?.company_hours || vendor.company_hours.length === 0) {
      setTimeSlots([]);
      return;
    }

    const dayOfWeek = selectedDate.getDay();
    const dayString = getDayString(dayOfWeek);
    const companyHour = vendor.company_hours.find((ch: any) => ch.day === dayString);

    if (!companyHour || !companyHour.is_available || !companyHour.slots || companyHour.slots.length === 0) {
      setTimeSlots([]);
      return;
    }

    const slots: TimeSlot[] = [];

    companyHour.slots.forEach((slot: any) => {
      if (!slot.start_time || !slot.end_time) return;

      const [startHour, startMin] = slot.start_time.split(':').map(Number);
      const [endHour, endMin] = slot.end_time.split(':').map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      // Generate 10-minute intervals
      for (let minutes = startMinutes; minutes < endMinutes; minutes += 10) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const timeString = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;

        slots.push({
          time: timeString,
          available: true,
        });
      }
    });

    setTimeSlots(slots);
  }, [vendor, selectedDate]);

  // Calculate total
  const total = useMemo(() => {
    return selectedServices.reduce((sum, service) => {
      const price = typeof service.price === 'number' ? service.price : parseFloat(String(service.price || 0));
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
  }, [selectedServices]);

  // Get dates for the week view (14 days starting from weekStartDate)
  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < 14; i++) {
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
    if (orderType === 'schedule' && !selectedTime) return;
    if (orderType === 'recurring' && !selectedTime) return;

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

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
    if (selectedTime) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`booking_${vendorId}_date`, selectedDate.toISOString());
        sessionStorage.setItem(`booking_${vendorId}_time`, selectedTime);
      }
      router.push(`/booking/${vendorId}/confirm`);
    }
  };

  // Handle back - go to services page
  const handleBack = () => {
    router.push(`/booking/${vendorId}`);
  };

  // Handle close
  const handleClose = () => {
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
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="h-11 w-11 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            <button
              onClick={handleClose}
              className="h-11 w-11 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Breadcrumb */}
        <div className="mb-6 pt-6">
          <BookingBreadcrumb currentStep="time" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Pane - Time Selection */}
          <div className="flex-1 min-w-0 pb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Select time</h1>

            {/* Order Type Selection */}
            <div className="mb-8">
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleOrderTypeSelect('now')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    orderType === 'now'
                      ? 'border-[#6950f3] bg-[#6950f3]/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <Zap className={`h-6 w-6 mb-2 ${orderType === 'now' ? 'text-[#6950f3]' : 'text-gray-600'}`} />
                  <span className={`text-sm font-semibold ${orderType === 'now' ? 'text-[#6950f3]' : 'text-gray-900'}`}>
                    Order Now
                  </span>
                  <span className="text-xs text-gray-500 mt-1">As soon as possible</span>
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
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {weekMonthYear}
                </h2>
                <div className="flex items-center gap-2">
                  {/* Calendar Icon Button */}
                  <button
                    onClick={() => setShowCalendarModal(true)}
                    className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                    aria-label="Open calendar"
                  >
                    <Calendar className="h-5 w-5 text-gray-700" />
                  </button>
                  <button
                    onClick={handlePreviousWeek}
                    className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                    aria-label="Previous week"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-700" />
                  </button>
                  <button
                    onClick={handleNextWeek}
                    className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                    aria-label="Next week"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Week Dates - Circular Buttons with slide animation */}
              <div className="overflow-hidden">
                <div
                  className={`flex justify-start gap-2 transition-all duration-200 ease-out ${
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
                        className={`flex flex-col items-center justify-center w-11 h-11 rounded-full transition-all duration-200 shrink-0 ${
                          isSelected
                            ? 'text-white'
                            : isPast
                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200'
                        }`}
                        style={isSelected ? { backgroundColor: '#6950f3' } : undefined}
                      >
                        <span className={`text-sm font-semibold leading-none ${isSelected ? 'text-white' : ''}`}>
                          {date.getDate()}
                        </span>
                        <span className={`text-[8px] leading-none mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                          {getDayName(date)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Available Time Slots */}
            <div className="space-y-2">
              {timeSlots.length > 0 ? (
                timeSlots.map((slot, index) => {
                  const isSelected = selectedTime === slot.time;

                  return (
                    <button
                      key={index}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'bg-white'
                          : slot.available
                          ? 'bg-white border-gray-200 hover:bg-gray-50'
                          : 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
                      }`}
                      style={isSelected ? { borderColor: '#6950f3' } : undefined}
                    >
                      <span className="text-[15px] font-medium text-gray-900">
                        {formatTime(slot.time)}
                      </span>
                    </button>
                  );
                })
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
          </div>

          {/* Right Pane - Order Summary */}
          <BookingSidebar
            vendor={vendor}
            selectedServices={selectedServices}
            total={total}
            onContinue={handleContinue}
            continueDisabled={!orderType || (orderType !== 'now' && !selectedTime)}
            showDurationRange={false}
          />
        </div>
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
    </div>
  );
}
