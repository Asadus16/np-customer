'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, X, Star, MapPin, Calendar, Clock, Store } from 'lucide-react';
import { useVendor, useAuth } from '@/hooks';
import api from '@/lib/api';

interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
}

interface Address {
  id: string;
  label: string;
  street_address: string;
  building?: string;
  apartment?: string;
  city: string;
  emirate?: string;
  is_primary: boolean;
}

export default function BookingConfirmPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.vendorId as string;

  const { vendor, isLoading: vendorLoading, error: vendorError } = useVendor(vendorId);
  const { user, isAuthenticated } = useAuth();
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<'cash' | 'card' | 'wallet'>('cash');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);

  // Load booking data from session storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedServices = sessionStorage.getItem(`booking_${vendorId}_services`);
      const storedProfessional = sessionStorage.getItem(`booking_${vendorId}_professional`);
      const storedDate = sessionStorage.getItem(`booking_${vendorId}_date`);
      const storedTime = sessionStorage.getItem(`booking_${vendorId}_time`);

      if (storedServices) {
        try {
          setSelectedServices(JSON.parse(storedServices));
        } catch (e) {
          console.error('Failed to parse stored services', e);
        }
      }

      if (storedProfessional && storedProfessional !== 'null') {
        setSelectedProfessional(storedProfessional);
      } else {
        setSelectedProfessional(null);
      }

      if (storedDate) {
        setSelectedDate(new Date(storedDate));
      }

      if (storedTime) {
        setSelectedTime(storedTime);
      }
    }
  }, [vendorId]);

  // Fetch addresses
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAddresses = async () => {
      setAddressesLoading(true);
      try {
        const response = await api.get('/customer/addresses');
        // Handle both possible response structures
        const addressList = response.data?.data || response.data || [];
        console.log('Fetched addresses:', addressList);
        setAddresses(addressList);
        // Select primary address or first address
        const primary = addressList.find((a: Address) => a.is_primary) || addressList[0];
        if (primary) {
          console.log('Selected address:', primary.id);
          setSelectedAddress(primary.id);
        } else if (addressList.length === 0) {
          console.warn('No addresses found for user');
        }
      } catch (error: any) {
        console.error('Failed to fetch addresses', error);
        // If 401, user might not be authenticated properly
        if (error.response?.status === 401) {
          console.error('Authentication error when fetching addresses');
        }
      } finally {
        setAddressesLoading(false);
      }
    };

    fetchAddresses();
  }, [isAuthenticated]);

  // Fetch technicians to get professional name
  useEffect(() => {
    const fetchTechnicians = async () => {
      if (!vendorId) return;
      
      try {
        const response = await api.get(`/public/vendors/${vendorId}/technicians`);
        setTechnicians(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch technicians', error);
      }
    };

    fetchTechnicians();
  }, [vendorId]);

  // Get selected professional name
  const selectedProfessionalName = useMemo(() => {
    if (selectedProfessional === null) {
      return 'any professional';
    }
    const tech = technicians.find(t => t.id === selectedProfessional);
    return tech ? tech.full_name : 'selected professional';
  }, [selectedProfessional, technicians]);

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

  // Calculate discounted subtotal
  const discountedSubtotal = useMemo(() => {
    return selectedServices.reduce((sum, service) => {
      const price = typeof service.price === 'number' ? service.price : parseFloat(String(service.price || 0));
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
  }, [selectedServices]);

  // Calculate tax (5% of discounted subtotal based on screenshot)
  const tax = useMemo(() => {
    return discountedSubtotal * 0.05;
  }, [discountedSubtotal]);

  // Calculate total
  const total = useMemo(() => {
    return discountedSubtotal + tax;
  }, [discountedSubtotal, tax]);

  // Format date for display (e.g., "Friday, 23 January")
  const formattedDate = useMemo(() => {
    if (!selectedDate) return '';
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayName = dayNames[selectedDate.getDay()];
    const day = selectedDate.getDate();
    const month = monthNames[selectedDate.getMonth()];
    return `${dayName}, ${day} ${month}`;
  }, [selectedDate]);

  // Format time range (e.g., "12:30-1:15 pm (45 mins duration)")
  const formattedTimeRange = useMemo(() => {
    if (!selectedTime || !selectedServices.length) return '';
    
    const totalDuration = selectedServices.reduce((sum, service) => {
      const duration = typeof service.duration === 'number' ? service.duration : parseInt(String(service.duration || 0), 10);
      return sum + (isNaN(duration) ? 0 : duration);
    }, 0);

    // Parse selected time
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    // Calculate end time
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + totalDuration);

    const formatTime = (date: Date) => {
      const h = date.getHours();
      const m = date.getMinutes();
      const ampm = h >= 12 ? 'pm' : 'am';
      const displayHour = h % 12 || 12;
      const displayMin = m.toString().padStart(2, '0');
      return `${displayHour}:${displayMin} ${ampm}`;
    };

    const startTimeStr = formatTime(startDate);
    const endTimeStr = formatTime(endDate);
    
    return `${startTimeStr}-${endTimeStr} (${totalDuration} mins duration)`;
  }, [selectedTime, selectedServices]);

  // Get location string
  const location = useMemo(() => {
    if (!vendor?.service_areas || vendor.service_areas.length === 0) {
      return 'Location not available';
    }
    return vendor.service_areas[0].name;
  }, [vendor]);

  // Handle apply discount code
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    
    setCouponError(null);
    try {
      // TODO: Implement coupon validation API call
      // For now, just show error
      setCouponError('Discount code not found');
    } catch (error: any) {
      setCouponError(error.response?.data?.message || 'Failed to apply discount code');
    }
  };

  // Handle confirm booking
  const handleConfirm = async () => {
    if (!selectedAddress || !selectedDate || !selectedTime || selectedServices.length === 0) {
      return;
    }

    if (!isAuthenticated) {
      router.push(`/booking/${vendorId}/time`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data
      const orderData = {
        vendor_id: vendorId,
        address_id: selectedAddress,
        payment_type: paymentType === 'cash' ? 'cash' : paymentType === 'card' ? 'card' : 'wallet',
        scheduled_date: selectedDate.toISOString().split('T')[0],
        scheduled_time: selectedTime.split(':').slice(0, 2).join(':'), // Format as HH:mm
        notes: notes || undefined,
        items: selectedServices.map(service => ({
          sub_service_id: service.id,
          quantity: 1,
        })),
        coupon_code: appliedCoupon ? discountCode : undefined,
      };

      const response = await api.post('/customer/orders', orderData);

      // Clear session storage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(`booking_${vendorId}_services`);
        sessionStorage.removeItem(`booking_${vendorId}_professional`);
        sessionStorage.removeItem(`booking_${vendorId}_date`);
        sessionStorage.removeItem(`booking_${vendorId}_time`);
      }

      // Navigate to order confirmation or order details
      if (response.data.data?.id) {
        router.push(`/customer/orders/${response.data.data.id}`);
      } else {
        router.push('/customer/orders');
      }
    } catch (error: any) {
      console.error('Failed to create order', error);
      alert(error.response?.data?.message || 'Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle back
  const handleBack = () => {
    router.push(`/booking/${vendorId}/time`);
  };

  // Handle close
  const handleClose = () => {
    router.push(`/vendor/${vendorId}`);
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

  if (vendorError || !vendor || !selectedDate || !selectedTime || selectedServices.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-gray-600 mb-6">
            {vendorError?.message || 'Missing booking information. Please start over.'}
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
                <span>Time</span>
                <span className="text-gray-400">•</span>
                <span className="font-medium text-gray-900">Confirm</span>
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
          {/* Left Pane - Booking Details */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Review and confirm</h1>

            {/* Payment Method */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment method</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setPaymentType('cash')}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-2 rounded-lg transition-all ${
                    paymentType === 'cash'
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Store className="h-5 w-5 text-gray-700" />
                  <span className="font-medium text-gray-900">Pay at venue</span>
                </button>
              </div>
            </div>

            {/* Discount Code */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Discount code</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Enter discount code"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <button
                  onClick={handleApplyDiscount}
                  className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Apply
                </button>
              </div>
              {couponError && (
                <p className="text-sm text-red-600 mt-2">{couponError}</p>
              )}
            </div>

            {/* Cancellation Policy */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Cancellation policy</h2>
              <p className="text-sm text-gray-600">Cancel for free anytime.</p>
            </div>

            {/* Booking Notes */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking notes</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Include comments or requests about your booking"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Right Pane - Booking Summary */}
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

              {/* Date and Time */}
              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{formattedTimeRange}</span>
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
                                {service.duration} mins • {service.name} with {selectedProfessionalName}
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
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">{tax.toFixed(2)} AED</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-gray-900">
                      {total.toFixed(2)} AED
                    </span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-gray-200 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Pay now</span>
                      <span className="text-gray-900">{paymentType === 'cash' ? '0.00' : total.toFixed(2)} AED</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Pay at venue</span>
                      <span className="text-gray-900">{paymentType === 'cash' ? total.toFixed(2) : '0.00'} AED</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Address Selection Message */}
              {addressesLoading && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">Loading addresses...</p>
                </div>
              )}
              {!addressesLoading && !selectedAddress && addresses.length === 0 && isAuthenticated && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Please add an address in your profile to continue booking. You can add an address from your profile settings.
                  </p>
                </div>
              )}
              {!addressesLoading && !selectedAddress && addresses.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Please select an address to continue.
                  </p>
                </div>
              )}

              {/* Confirm Button */}
              <button
                onClick={handleConfirm}
                disabled={isSubmitting || !selectedAddress}
                className={`w-full py-4 rounded-lg font-semibold transition-colors ${
                  isSubmitting || !selectedAddress
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {isSubmitting ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
