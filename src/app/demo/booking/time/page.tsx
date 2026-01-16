'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X, ChevronLeft, ChevronRight, Calendar, Zap, Clock, Repeat, Star } from 'lucide-react';
import { BookingBreadcrumb } from '@/components/booking';

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

function formatDurationRange(min: number, max?: number): string {
  const formatSingle = (mins: number): string => {
    if (mins < 60) return `${mins} mins`;
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    if (remaining === 0) return `${hours} hr`;
    return `${hours} hr, ${remaining} mins`;
  };
  if (!max || min === max) return formatSingle(min);
  return `${formatSingle(min)} - ${formatSingle(max)}`;
}

export default function DemoBookingTimePage() {
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [timeSlots] = useState(generateTimeSlots());
  const [weekStartDate, setWeekStartDate] = useState<Date>(() => new Date());
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
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

  // Get week dates
  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    const start = new Date(weekStartDate);
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [weekStartDate]);

  // Get month and year for display
  const weekMonthYear = useMemo(() => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  }, [selectedDate]);

  // Format time for display
  const formatTimeForDisplay = (time: string): string => {
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

  // Handle back
  const handleBack = () => {
    router.push('/demo/booking');
  };

  // Handle close
  const handleClose = () => {
    router.push('/demo/vendor');
  };

  // Navigate weeks
  const goToPreviousWeek = () => {
    const newStart = new Date(weekStartDate);
    newStart.setDate(newStart.getDate() - 7);
    setWeekStartDate(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(weekStartDate);
    newStart.setDate(newStart.getDate() + 7);
    setWeekStartDate(newStart);
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Check if date is selected
  const isDateSelected = (date: Date): boolean => {
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };

  // Check if date is in past
  const isDateInPast = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  // Calendar days
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = (firstDay.getDay() + 6) % 7;
    const days: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [calendarMonth]);

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

            {/* Week View Date Selection */}
            {(orderType === 'schedule' || orderType === 'recurring') && (
              <>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">{weekMonthYear}</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowCalendarModal(true)}
                        className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                      >
                        <Calendar className="h-5 w-5 text-gray-600" />
                      </button>
                      <button
                        onClick={goToPreviousWeek}
                        className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                      </button>
                      <button
                        onClick={goToNextWeek}
                        className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Week Days */}
                  <div className="grid grid-cols-7 gap-2">
                    {weekDates.map((date, index) => {
                      const isPast = isDateInPast(date);
                      const isSelected = isDateSelected(date);
                      const isTodayDate = isToday(date);
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                      return (
                        <button
                          key={index}
                          onClick={() => !isPast && setSelectedDate(date)}
                          disabled={isPast}
                          className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all ${
                            isPast
                              ? 'opacity-40 cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#6950f3] text-white'
                              : isWeekend
                              ? 'bg-gray-100 hover:bg-gray-200'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <span className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                            {date.getDate()}
                          </span>
                          <span className={`text-xs font-medium ${
                            isSelected ? 'text-white/80' : isTodayDate ? 'text-[#6950f3]' : 'text-gray-500'
                          }`}>
                            {isTodayDate ? 'Today' : getDayName(date)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Available times</h2>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-[300px] overflow-y-auto">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-3 px-2 rounded-lg text-sm font-medium transition-all ${
                          selectedTime === slot.time
                            ? 'bg-gray-200 text-gray-900'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {formatTimeForDisplay(slot.time)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    className="text-sm font-medium hover:opacity-80 transition-opacity"
                    style={{ color: '#6950f3' }}
                  >
                    Can&apos;t find a suitable time? Join waitlist
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right Pane - Order Summary */}
          <div className="w-full lg:w-105 shrink-0">
            <div className="lg:sticky lg:top-24 bg-white border border-gray-200 rounded-2xl overflow-hidden">
              {/* Vendor Info */}
              <div className="p-6">
                <div className="flex gap-4">
                  <img
                    src={DEMO_VENDOR.logo}
                    alt={DEMO_VENDOR.name}
                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h2 className="font-bold text-gray-900 mb-1 truncate">{DEMO_VENDOR.name}</h2>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {DEMO_VENDOR.rating.toFixed(1)}
                      </span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${
                              star <= Math.round(DEMO_VENDOR.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        ({DEMO_VENDOR.reviews_count.toLocaleString()})
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{DEMO_VENDOR.service_areas[0].name}</p>
                  </div>
                </div>
              </div>

              {/* Selected Services */}
              <div className="px-6 pb-6">
                <div className="space-y-4">
                  {selectedServices.map((service) => (
                    <div key={service.id} className="flex justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm mb-0.5">{service.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatDurationRange(service.duration, service.durationMax)}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm shrink-0">AED {service.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="mx-6 border-t border-gray-100" />

              {/* Total */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-gray-900">AED {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Continue Button */}
              <div className="p-6 pt-0">
                <button
                  onClick={handleContinue}
                  disabled={!orderType || (orderType !== 'now' && !selectedTime)}
                  className={`w-full py-4 rounded-full font-semibold transition-colors ${
                    orderType && (orderType === 'now' || selectedTime)
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => {
                  const newMonth = new Date(calendarMonth);
                  newMonth.setMonth(newMonth.getMonth() - 1);
                  setCalendarMonth(newMonth);
                }}
                className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h3 className="text-lg font-semibold text-gray-900">
                {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={() => {
                  const newMonth = new Date(calendarMonth);
                  newMonth.setMonth(newMonth.getMonth() + 1);
                  setCalendarMonth(newMonth);
                }}
                className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded-full"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="h-10" />;
                }

                const isPast = isDateInPast(date);
                const isSelected = isDateSelected(date);
                const isTodayDate = isToday(date);

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => {
                      if (!isPast) {
                        setSelectedDate(date);
                        const newWeekStart = new Date(date);
                        newWeekStart.setDate(date.getDate() - date.getDay());
                        setWeekStartDate(newWeekStart);
                        setShowCalendarModal(false);
                      }
                    }}
                    disabled={isPast}
                    className={`h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium transition-all mx-auto ${
                      isPast
                        ? 'text-gray-300 cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#6950f3] text-white'
                        : isTodayDate
                        ? 'border-2 border-[#6950f3] text-[#6950f3]'
                        : 'hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowCalendarModal(false)}
              className="w-full mt-6 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
