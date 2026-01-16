'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X, ChevronLeft, ChevronRight, Calendar, Zap, Clock, Repeat } from 'lucide-react';
import { BookingBreadcrumb, BookingSidebar, LoginModal } from '@/components/booking';
import { useAuth } from '@/hooks';

type OrderType = 'now' | 'schedule' | 'recurring';
type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration: number;
  durationMax?: number;
  category: string;
}

const DEMO_VENDOR_ID = 'demo-vendor-001';

const DEMO_VENDOR = {
  id: DEMO_VENDOR_ID,
  name: 'Glamour Beauty Salon & Spa',
  logo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop',
  rating: 4.8,
  reviews_count: 1247,
  service_areas: [{ name: 'Downtown Dubai' }],
};

// Generate time slots from 9am to 9pm with 10-minute intervals
function generateTimeSlots(): { time: string; available: boolean }[] {
  const slots: { time: string; available: boolean }[] = [];
  for (let hour = 9; hour <= 21; hour++) {
    for (let min = 0; min < 60; min += 10) {
      if (hour === 21 && min > 0) break;
      const timeString = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`;
      slots.push({ time: timeString, available: true });
    }
  }
  return slots;
}


export default function DemoBookingTimePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [timeSlots] = useState(generateTimeSlots());
  const [weekStartDate, setWeekStartDate] = useState<Date>(() => new Date());
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [orderType, setOrderType] = useState<OrderType | null>(null);
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>('weekly');

  // Load selected services from session storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedServices = sessionStorage.getItem(`booking_${DEMO_VENDOR_ID}_services`);
      if (storedServices) {
        try {
          setSelectedServices(JSON.parse(storedServices));
        } catch (e) {
          console.error('Failed to parse stored services', e);
        }
      }
    }
  }, []);

  // Calculate total price
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

  // Get day name
  const getDayName = (date: Date): string => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayNames[date.getDay()];
  };

  // Handle order type selection
  const handleOrderTypeSelect = (type: OrderType) => {
    setOrderType(type);
    if (type === 'now') {
      // Check if authenticated
      if (!isAuthenticated) {
        setShowLoginModal(true);
        return;
      }

      const now = new Date();
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`booking_${DEMO_VENDOR_ID}_date`, now.toISOString());
        sessionStorage.setItem(`booking_${DEMO_VENDOR_ID}_time`, 'now');
        sessionStorage.setItem(`booking_${DEMO_VENDOR_ID}_order_type`, 'now');
      }
      router.push(`/demo/booking/confirm`);
    }
  };

  // Handle continue
  const handleContinue = () => {
    if (orderType === 'schedule' && !selectedTime) return;
    if (orderType === 'recurring' && !selectedTime) return;

    // Check if authenticated
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`booking_${DEMO_VENDOR_ID}_date`, selectedDate.toISOString());
      sessionStorage.setItem(`booking_${DEMO_VENDOR_ID}_time`, selectedTime || '');
      sessionStorage.setItem(`booking_${DEMO_VENDOR_ID}_order_type`, orderType || 'schedule');
      if (orderType === 'recurring') {
        sessionStorage.setItem(`booking_${DEMO_VENDOR_ID}_recurring_frequency`, recurringFrequency);
      }
    }
    router.push(`/demo/booking/confirm`);
  };

  // Handle login success
  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // After successful login, proceed to confirm page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`booking_${DEMO_VENDOR_ID}_date`, selectedDate.toISOString());
      sessionStorage.setItem(`booking_${DEMO_VENDOR_ID}_time`, selectedTime || 'now');
      sessionStorage.setItem(`booking_${DEMO_VENDOR_ID}_order_type`, orderType || 'schedule');
      if (orderType === 'recurring') {
        sessionStorage.setItem(`booking_${DEMO_VENDOR_ID}_recurring_frequency`, recurringFrequency);
      }
    }
    router.push(`/demo/booking/confirm`);
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setShowCalendarModal(false);
  };

  // Handle back
  const handleBack = () => {
    router.push('/demo/booking');
  };

  // Handle close
  const handleClose = () => {
    router.push('/demo/vendor');
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

  if (selectedServices.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-gray-600 mb-6">No services selected. Please select services first.</p>
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

              {/* Week Dates - Rectangular Buttons with slide animation */}
              <div className="overflow-hidden">
                <div
                  className={`flex gap-2 transition-all duration-200 ease-out ${
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
                    const isSaturday = date.getDay() === 6;

                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => !isPast && handleDateSelect(date)}
                        disabled={isPast}
                        className={`flex flex-col items-center justify-center py-4 px-4 rounded-2xl transition-all min-w-[72px] ${
                          isPast
                            ? 'opacity-40 cursor-not-allowed border border-gray-200'
                            : isSelected
                            ? 'bg-[#6950f3] text-white border-2 border-[#6950f3]'
                            : isSaturday
                            ? 'bg-white border-2 border-gray-300 hover:border-gray-400'
                            : 'bg-white border border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                          {date.getDate()}
                        </span>
                        <span className={`text-xs font-medium mt-1 ${
                          isSelected ? 'text-white' : isToday ? 'text-[#6950f3]' : 'text-gray-500'
                        }`}>
                          {isToday ? 'Today' : getDayName(date)}
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
                <div className="flex flex-col gap-2">
                  {timeSlots.map((slot, index) => {
                    const isSelected = selectedTime === slot.time;

                    return (
                      <button
                        key={index}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-all text-left ${
                          isSelected
                            ? 'bg-gray-100 text-gray-900 border-2 border-[#6950f3]'
                            : slot.available
                            ? 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                            : 'bg-gray-50 border border-gray-100 text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        {formatTime(slot.time)}
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
          </div>

          {/* Right Pane - Order Summary */}
          <BookingSidebar
            vendor={{ ...DEMO_VENDOR, logo: DEMO_VENDOR.logo ?? undefined }}
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
