'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X, Calendar, Clock, CreditCard, Wallet, Check, Plus, Home, ChevronRight, Store, Star } from 'lucide-react';
import { BookingBreadcrumb } from '@/components/booking';

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
  is_primary: boolean;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiry_month: string;
  expiry_year: string;
  is_default: boolean;
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

const DEMO_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    label: 'Home',
    street_address: '123 Palm Jumeirah',
    building: 'Marina Residences',
    apartment: '1504',
    city: 'Dubai',
    is_primary: true,
  },
  {
    id: 'addr-2',
    label: 'Office',
    street_address: 'DIFC Gate Building',
    building: 'Tower 2',
    apartment: 'Suite 2100',
    city: 'Dubai',
    is_primary: false,
  },
];

const DEMO_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm-1',
    brand: 'visa',
    last4: '4242',
    expiry_month: '12',
    expiry_year: '2027',
    is_default: true,
  },
  {
    id: 'pm-2',
    brand: 'mastercard',
    last4: '8888',
    expiry_month: '06',
    expiry_year: '2026',
    is_default: false,
  },
];

function getCardBrandDisplay(brand: string): { name: string } {
  const brands: Record<string, { name: string }> = {
    visa: { name: 'Visa' },
    mastercard: { name: 'Mastercard' },
    amex: { name: 'American Express' },
  };
  return brands[brand.toLowerCase()] || { name: brand };
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

export default function DemoBookingConfirmPage() {
  const router = useRouter();

  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [addresses] = useState<Address[]>(DEMO_ADDRESSES);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(DEMO_ADDRESSES[0].id);
  const [paymentType, setPaymentType] = useState<'cash' | 'card' | 'wallet'>('cash');
  const [discountCode, setDiscountCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethods] = useState<PaymentMethod[]>(DEMO_PAYMENT_METHODS);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(DEMO_PAYMENT_METHODS[0].id);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load booking data from session storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedServices = sessionStorage.getItem(`booking_${DEMO_VENDOR_ID}_services`);
      const storedDate = sessionStorage.getItem(`booking_${DEMO_VENDOR_ID}_date`);
      const storedTime = sessionStorage.getItem(`booking_${DEMO_VENDOR_ID}_time`);

      if (storedServices) {
        try {
          setSelectedServices(JSON.parse(storedServices));
        } catch (e) {
          console.error('Failed to parse stored services', e);
        }
      }

      if (storedDate) {
        setSelectedDate(new Date(storedDate));
      }

      if (storedTime) {
        setSelectedTime(storedTime);
      }
    }
  }, []);

  // Calculate total
  const total = useMemo(() => {
    return selectedServices.reduce((sum, service) => {
      const price = typeof service.price === 'number' ? service.price : parseFloat(String(service.price || 0));
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
  }, [selectedServices]);

  // Format date for display
  const formattedDate = useMemo(() => {
    if (!selectedDate) return '';
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayName = dayNames[selectedDate.getDay()];
    const day = selectedDate.getDate();
    const month = monthNames[selectedDate.getMonth()];
    return `${dayName}, ${day} ${month}`;
  }, [selectedDate]);

  // Format time range
  const formattedTimeRange = useMemo(() => {
    if (!selectedTime || !selectedServices.length) return '';

    if (selectedTime === 'now') {
      return 'As soon as possible';
    }

    const totalDuration = selectedServices.reduce((sum, service) => {
      const duration = typeof service.duration === 'number' ? service.duration : parseInt(String(service.duration || 0), 10);
      return sum + (isNaN(duration) ? 0 : duration);
    }, 0);

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

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

    return `${formatTime(startDate)}-${formatTime(endDate)} (${totalDuration} mins duration)`;
  }, [selectedTime, selectedServices]);

  // Handle apply discount code
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setCouponError('Discount code not found');
  };

  // Handle confirm booking (Demo - just shows success)
  const handleConfirm = async () => {
    if (!selectedAddress || !selectedDate || !selectedTime || selectedServices.length === 0) {
      return;
    }

    if (paymentType === 'card' && !selectedPaymentMethod) {
      alert('Please select a payment card');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Clear session storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`booking_${DEMO_VENDOR_ID}_services`);
      sessionStorage.removeItem(`booking_${DEMO_VENDOR_ID}_date`);
      sessionStorage.removeItem(`booking_${DEMO_VENDOR_ID}_time`);
      sessionStorage.removeItem(`booking_${DEMO_VENDOR_ID}_order_type`);
    }

    // Show success message
    setShowSuccess(true);
    setIsSubmitting(false);

    // Redirect to demo vendor page after 3 seconds
    // Set flag to indicate coming from booking flow
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('came_from_booking_redirect', 'true');
    }
    setTimeout(() => {
      router.push('/demo/vendor');
    }, 3000);
  };

  // Handle back
  const handleBack = () => {
    router.push('/demo/booking/time');
  };

  // Handle close
  const handleClose = () => {
    router.push('/demo/vendor');
  };

  // Success overlay
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Check className="h-10 w-10 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-2">Your appointment has been successfully booked.</p>
          <p className="text-sm text-gray-500 mb-8">Redirecting to vendor page...</p>

          {/* Manual redirect button */}
          <button
            onClick={() => router.push('/demo/vendor')}
            className="px-8 py-3 bg-[#6950f3] text-white rounded-xl font-medium hover:bg-[#5840d9] transition-colors"
          >
            Back to Vendor
          </button>
        </div>
      </div>
    );
  }

  if (!selectedDate || !selectedTime || selectedServices.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-gray-600 mb-6">Missing booking information. Please start over.</p>
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
          <BookingBreadcrumb currentStep="confirm" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Pane - Booking Details */}
          <div className="flex-1 min-w-0 pb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Review and confirm</h1>

            {/* Address Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Select address</h2>
                <button className="text-sm font-medium text-[#6950f3] hover:opacity-80 transition-opacity flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add new
                </button>
              </div>

              <div className="space-y-3">
                {addresses.map((address) => (
                  <button
                    key={address.id}
                    onClick={() => setSelectedAddress(address.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedAddress === address.id
                        ? 'border-[#6950f3] bg-[#6950f3]/5'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedAddress === address.id
                          ? 'border-[#6950f3] bg-[#6950f3]'
                          : 'border-gray-300'
                      }`}>
                        {selectedAddress === address.id && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{address.label}</span>
                          {address.is_primary && (
                            <span className="text-xs bg-[#6950f3]/10 text-[#6950f3] px-2 py-0.5 rounded-full font-medium">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {address.street_address}
                          {address.building && `, ${address.building}`}
                          {address.apartment && `, Apt ${address.apartment}`}
                          {address.city && `, ${address.city}`}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment method</h2>
              <div className="space-y-3">
                {/* Pay with Card Option */}
                <button
                  onClick={() => setPaymentType('card')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    paymentType === 'card'
                      ? 'border-[#6950f3] bg-[#6950f3]/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    paymentType === 'card'
                      ? 'border-[#6950f3] bg-[#6950f3]'
                      : 'border-gray-300'
                  }`}>
                    {paymentType === 'card' && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <CreditCard className={`h-5 w-5 ${paymentType === 'card' ? 'text-[#6950f3]' : 'text-gray-500'}`} />
                  <div className="flex-1 text-left">
                    <span className={`font-medium ${paymentType === 'card' ? 'text-gray-900' : 'text-gray-700'}`}>
                      Pay with Card
                    </span>
                    <p className="text-xs text-gray-500">Credit or debit card</p>
                  </div>
                  <ChevronRight className={`h-5 w-5 ${paymentType === 'card' ? 'text-[#6950f3]' : 'text-gray-400'}`} />
                </button>

                {/* Saved Cards */}
                {paymentType === 'card' && (
                  <div className="ml-8 space-y-2">
                    {paymentMethods.map((pm) => {
                      const brandInfo = getCardBrandDisplay(pm.brand);
                      return (
                        <button
                          key={pm.id}
                          onClick={() => setSelectedPaymentMethod(pm.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            selectedPaymentMethod === pm.id
                              ? 'border-[#6950f3] bg-[#6950f3]/5'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            selectedPaymentMethod === pm.id
                              ? 'border-[#6950f3] bg-[#6950f3]'
                              : 'border-gray-300'
                          }`}>
                            {selectedPaymentMethod === pm.id && (
                              <Check className="h-2.5 w-2.5 text-white" />
                            )}
                          </div>
                          <CreditCard className="h-4 w-4 text-gray-400" />
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900">
                              {brandInfo.name} •••• {pm.last4}
                            </p>
                            <p className="text-xs text-gray-500">
                              Expires {pm.expiry_month}/{pm.expiry_year}
                            </p>
                          </div>
                          {pm.is_default && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </button>
                      );
                    })}
                    <button className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium text-[#6950f3] hover:bg-[#6950f3]/5 rounded-lg transition-colors">
                      <Plus className="h-4 w-4" />
                      Add new card
                    </button>
                  </div>
                )}

                {/* Pay with Cash Option */}
                <button
                  onClick={() => setPaymentType('cash')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    paymentType === 'cash'
                      ? 'border-[#6950f3] bg-[#6950f3]/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    paymentType === 'cash'
                      ? 'border-[#6950f3] bg-[#6950f3]'
                      : 'border-gray-300'
                  }`}>
                    {paymentType === 'cash' && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <Store className={`h-5 w-5 ${paymentType === 'cash' ? 'text-[#6950f3]' : 'text-gray-500'}`} />
                  <div className="flex-1 text-left">
                    <span className={`font-medium ${paymentType === 'cash' ? 'text-gray-900' : 'text-gray-700'}`}>
                      Pay with Cash
                    </span>
                    <p className="text-xs text-gray-500">Pay at venue</p>
                  </div>
                </button>

                {/* Use Points Option */}
                <button
                  onClick={() => setPaymentType('wallet')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    paymentType === 'wallet'
                      ? 'border-[#6950f3] bg-[#6950f3]/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    paymentType === 'wallet'
                      ? 'border-[#6950f3] bg-[#6950f3]'
                      : 'border-gray-300'
                  }`}>
                    {paymentType === 'wallet' && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <Wallet className={`h-5 w-5 ${paymentType === 'wallet' ? 'text-[#6950f3]' : 'text-gray-500'}`} />
                  <div className="flex-1 text-left">
                    <span className={`font-medium ${paymentType === 'wallet' ? 'text-gray-900' : 'text-gray-700'}`}>
                      Use Points
                    </span>
                    <p className="text-xs text-gray-500">Redeem your reward points</p>
                  </div>
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

              {/* Date and Time */}
              <div className="px-6 pb-4 space-y-2">
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
              <div className="px-6 pb-6">
                <div className="space-y-4">
                  {selectedServices.map((service) => (
                    <div key={service.id} className="flex justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm mb-0.5">{service.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatDurationRange(service.duration)}
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

              {/* Confirm Button */}
              <div className="p-6 pt-0">
                <button
                  onClick={handleConfirm}
                  disabled={isSubmitting || !selectedAddress || (paymentType === 'card' && !selectedPaymentMethod)}
                  className={`w-full py-4 rounded-full font-semibold transition-colors ${
                    isSubmitting || !selectedAddress || (paymentType === 'card' && !selectedPaymentMethod)
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
