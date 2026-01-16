'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, X, Star, MapPin, ChevronDown, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useVendor, useAuth } from '@/hooks';
import api from '@/lib/api';
import LoginModal from '@/components/booking/LoginModal';

interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
}

interface Technician {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar?: string;
  initials: string;
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
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  const [selectedProfessionalName, setSelectedProfessionalName] = useState<string>('Any professional');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Load selected data from session storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedServices = sessionStorage.getItem(`booking_${vendorId}_services`);
      const storedProfessional = sessionStorage.getItem(`booking_${vendorId}_professional`);
      
      if (storedServices) {
        try {
          setSelectedServices(JSON.parse(storedServices));
        } catch (e) {
          console.error('Failed to parse stored services', e);
        }
      }

      if (storedProfessional) {
        setSelectedProfessional(storedProfessional);
      }
    }
  }, [vendorId]);

  // Fetch technicians
  useEffect(() => {
    const fetchTechnicians = async () => {
      if (!vendorId) return;
      
      try {
        const response = await api.get(`/public/vendors/${vendorId}/technicians`);
        const techs = response.data.data || [];
        setTechnicians(techs);
        
        // Update professional name if one is selected
        if (selectedProfessional) {
          if (selectedProfessional === 'null' || selectedProfessional === '') {
            setSelectedProfessionalName('Any professional');
            setSelectedProfessional(null);
          } else {
            const tech = techs.find((t: Technician) => t.id === selectedProfessional);
            if (tech) {
              setSelectedProfessionalName(tech.full_name);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch technicians', error);
        setTechnicians([]);
      }
    };

    fetchTechnicians();
  }, [vendorId, selectedProfessional]);

  // Map day of week (0-6) to day string
  const getDayString = (dayOfWeek: number): string => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayOfWeek];
  };

  // Generate time slots based on company hours
  useEffect(() => {
    if (!vendor?.company_hours || vendor.company_hours.length === 0) {
      setTimeSlots([]);
      return;
    }

    // Get the day of week for selected date (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = selectedDate.getDay();
    const dayString = getDayString(dayOfWeek);
    const companyHour = vendor.company_hours.find((ch: any) => ch.day === dayString);

    if (!companyHour || !companyHour.is_available || !companyHour.slots || companyHour.slots.length === 0) {
      setTimeSlots([]);
      return;
    }

    // Generate time slots from company hour slots
    // Each slot has start_time and end_time, we'll generate 15-minute intervals
    const slots: TimeSlot[] = [];
    
    companyHour.slots.forEach((slot: any) => {
      if (!slot.start_time || !slot.end_time) return;
      
      // Parse start and end times
      const [startHour, startMin] = slot.start_time.split(':').map(Number);
      const [endHour, endMin] = slot.end_time.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      // Generate 15-minute intervals
      for (let minutes = startMinutes; minutes < endMinutes; minutes += 15) {
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

  // Calculate subtotal (original prices)
  const subtotal = useMemo(() => {
    return selectedServices.reduce((sum, service) => {
      const price = typeof service.price === 'number' ? service.price : parseFloat(String(service.price || 0));
      const originalPrice = price / 0.9; // Reverse the 10% discount
      return sum + (isNaN(originalPrice) ? 0 : originalPrice);
    }, 0);
  }, [selectedServices]);

  // Calculate discount (10% off)
  const discount = useMemo(() => {
    return subtotal * 0.1;
  }, [subtotal]);

  // Calculate total (after discount)
  const total = useMemo(() => {
    return selectedServices.reduce((sum, service) => {
      const price = typeof service.price === 'number' ? service.price : parseFloat(String(service.price || 0));
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
  }, [selectedServices]);

  // Get location string
  const location = useMemo(() => {
    if (!vendor?.service_areas || vendor.service_areas.length === 0) {
      return 'Location not available';
    }
    return vendor.service_areas[0].name;
  }, [vendor]);

  // Get dates for the week view
  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    const startOfWeek = new Date(currentMonth);
    // Find the first day of the week (Sunday)
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentMonth]);

  // Format time for display (e.g., "4:45 pm")
  const formatTime = (time: string): string => {
    if (!time) return '';
    // Handle both "HH:mm:ss" and "HH:mm" formats
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Format date for display (e.g., "16 Fri")
  const formatDateLabel = (date: Date): string => {
    const day = date.getDate();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[date.getDay()];
    return `${day} ${dayName}`;
  };

  // Format business hours for display
  const formatBusinessHours = useMemo(() => {
    if (!vendor?.company_hours || vendor.company_hours.length === 0) {
      return null;
    }

    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayLabels: Record<string, string> = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun',
    };

    // Sort by day order
    const sortedHours = [...vendor.company_hours].sort((a, b) => {
      return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
    });

    return sortedHours.map((hour: any) => {
      if (!hour.is_available || !hour.slots || hour.slots.length === 0) {
        return {
          day: dayLabels[hour.day] || hour.day,
          hours: 'Closed',
        };
      }

      // Get the earliest start time and latest end time from all slots
      const times = hour.slots.map((slot: any) => ({
        start: slot.start_time,
        end: slot.end_time,
      }));

      const earliestStart = times.reduce((earliest: string, current: any) => {
        return current.start < earliest ? current.start : earliest;
      }, times[0].start);

      const latestEnd = times.reduce((latest: string, current: any) => {
        return current.end > latest ? current.end : latest;
      }, times[0].end);

      // Format time helper function
      const formatTimeHelper = (time: string): string => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'pm' : 'am';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      };

      return {
        day: dayLabels[hour.day] || hour.day,
        hours: `${formatTimeHelper(earliestStart)} - ${formatTimeHelper(latestEnd)}`,
      };
    });
  }, [vendor]);

  // Get business hours for selected date
  const selectedDateHours = useMemo(() => {
    if (!vendor?.company_hours || !selectedDate) return null;
    
    const dayString = getDayString(selectedDate.getDay());
    const companyHour = vendor.company_hours.find((ch: any) => ch.day === dayString);
    
    if (!companyHour || !companyHour.is_available || !companyHour.slots || companyHour.slots.length === 0) {
      return null;
    }

    const times = companyHour.slots.map((slot: any) => ({
      start: slot.start_time,
      end: slot.end_time,
    }));

    const earliestStart = times.reduce((earliest: string, current: any) => {
      return current.start < earliest ? current.start : earliest;
    }, times[0].start);

    const latestEnd = times.reduce((latest: string, current: any) => {
      return current.end > latest ? current.end : latest;
    }, times[0].end);

    return `${formatTime(earliestStart)} - ${formatTime(latestEnd)}`;
  }, [vendor, selectedDate]);

  // Handle continue
  const handleContinue = () => {
    if (!selectedTime) return;
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    
    // Store selected date and time, then navigate to confirm
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`booking_${vendorId}_date`, selectedDate.toISOString());
      sessionStorage.setItem(`booking_${vendorId}_time`, selectedTime);
    }
    router.push(`/booking/${vendorId}/confirm`);
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // After login, continue with the booking
    if (selectedTime) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`booking_${vendorId}_date`, selectedDate.toISOString());
        sessionStorage.setItem(`booking_${vendorId}_time`, selectedTime);
      }
      router.push(`/booking/${vendorId}/confirm`);
    }
  };

  // Handle back
  const handleBack = () => {
    router.push(`/booking/${vendorId}/professional`);
  };

  // Handle close
  const handleClose = () => {
    router.push(`/vendor/${vendorId}`);
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  };

  // Navigate months
  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
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
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-6">
              <button
                onClick={handleBack}
                className="h-10 w-10 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Services</span>
                <span className="text-gray-400">•</span>
                <span>Professional</span>
                <span className="text-gray-400">•</span>
                <span className="font-medium text-gray-900">Time</span>
                <span className="text-gray-400">•</span>
                <span>Confirm</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="h-10 w-10 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 py-8">
          {/* Left Pane - Time Selection */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Select time</h1>

            {/* Professional Selection Dropdown */}
            <div className="mb-6">
              <button className="flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full text-left">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  {selectedProfessional && technicians.find(t => t.id === selectedProfessional)?.avatar ? (
                    <img
                      src={technicians.find(t => t.id === selectedProfessional)?.avatar}
                      alt={selectedProfessionalName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-purple-600 font-semibold text-sm">
                      {selectedProfessional && technicians.find(t => t.id === selectedProfessional)
                        ? technicians.find(t => t.id === selectedProfessional)?.initials
                        : 'AP'}
                    </span>
                  )}
                </div>
                <span className="flex-1 font-medium text-gray-900">{selectedProfessionalName}</span>
                <ChevronDown className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Business Hours */}
            {formatBusinessHours && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Business Hours</h3>
                <div className="space-y-2">
                  {formatBusinessHours.map((hour, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 font-medium">{hour.day}</span>
                      <span className={`${hour.hours === 'Closed' ? 'text-gray-400' : 'text-gray-900'}`}>
                        {hour.hours}
                      </span>
                    </div>
                  ))}
                </div>
                {selectedDateHours && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 font-medium">
                        {formatDateLabel(selectedDate)}
                      </span>
                      <span className="text-gray-900 font-semibold">{selectedDateHours}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Calendar/Date Picker */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <Calendar className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviousMonth}
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-700" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Week Dates */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {weekDates.map((date) => {
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => handleDateSelect(date)}
                      className={`shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 transition-all ${
                        isSelected
                          ? 'bg-purple-500 border-purple-500 text-white'
                          : isToday
                          ? 'border-gray-300 bg-gray-50 text-gray-900'
                          : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xs font-medium">{formatDateLabel(date).split(' ')[0]}</span>
                      <span className="text-xs">{formatDateLabel(date).split(' ')[1]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Available Time Slots */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Available Times</h3>
              {timeSlots.length > 0 ? (
                timeSlots.map((slot, index) => {
                  const isSelected = selectedTime === slot.time;
                  const originalPrice = subtotal;
                  const discountedPrice = total;
                  
                  return (
                    <div
                      key={index}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      className={`bg-white border-2 rounded-xl p-5 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50'
                          : slot.available
                          ? 'border-gray-200 hover:border-gray-300'
                          : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-lg font-semibold text-gray-900">
                            {formatTime(slot.time)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-green-600">10% off</span>
                          <span className="text-sm text-gray-400 line-through">
                            {originalPrice.toFixed(2)} AED
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {discountedPrice.toFixed(2)} AED
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No time slots available for this date.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Pane - Order Summary */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              {/* Vendor Info */}
              <div className="mb-6">
                {vendor.logo && (
                  <img
                    src={vendor.logo}
                    alt={vendor.name}
                    className="w-16 h-16 rounded-lg object-cover mb-4"
                  />
                )}
                <h2 className="text-lg font-bold text-gray-900 mb-2">{vendor.name}</h2>
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(vendor.rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-900 ml-1">
                    {vendor.rating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-sm text-gray-600">
                    ({vendor.reviews_count || 0})
                  </span>
                </div>
                <div className="flex items-start gap-1 text-sm text-gray-600">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span className="line-clamp-2 text-xs">{location}</span>
                </div>
              </div>

              {/* Selected Services */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Selected Services</h3>
                {selectedServices.length > 0 ? (
                  <div className="space-y-3">
                    {selectedServices.map((service) => {
                      const originalPrice = (typeof service.price === 'number' ? service.price : parseFloat(String(service.price || 0)) || 0) / 0.9;
                      const discountedPrice = typeof service.price === 'number' ? service.price : parseFloat(String(service.price || 0)) || 0;
                      
                      return (
                        <div
                          key={service.id}
                          className="bg-white p-3 rounded-lg"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 mb-1">{service.name}</p>
                              <p className="text-xs text-gray-500">
                                {service.duration} mins • {service.name} with {selectedProfessionalName.toLowerCase()}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">
                              from {discountedPrice.toFixed(2)} AED
                            </p>
                            <p className="text-xs text-gray-400 line-through">
                              {originalPrice.toFixed(2)} AED
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No services selected</p>
                )}
              </div>

              {/* Cost Breakdown */}
              {selectedServices.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{subtotal.toFixed(2)} AED</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Discounts</span>
                    <span className="text-green-600">-{discount.toFixed(2)} AED</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-gray-900">
                      from {total.toFixed(2)} AED
                    </span>
                  </div>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={!selectedTime}
                className={`w-full py-4 rounded-lg font-semibold transition-colors ${
                  selectedTime
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
