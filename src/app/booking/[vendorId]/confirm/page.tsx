'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, X, Calendar, Clock, Store, CreditCard, Wallet, Check, Plus, Home, ChevronRight } from 'lucide-react';
import { useVendor, useAuth } from '@/hooks';
import { BookingBreadcrumb, BookingSidebar } from '@/components/booking';
import api from '@/lib/api';
import { getPaymentMethods, PaymentMethod, getCardBrandDisplay } from '@/services/paymentService';

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
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load booking data from session storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedServices = sessionStorage.getItem(`booking_${vendorId}_services`);
      const storedDate = sessionStorage.getItem(`booking_${vendorId}_date`);
      const storedTime = sessionStorage.getItem(`booking_${vendorId}_time`);

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

  // Fetch payment methods
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchPaymentMethodsData = async () => {
      setPaymentMethodsLoading(true);
      try {
        const methods = await getPaymentMethods();
        setPaymentMethods(methods);
        // Select default payment method or first one
        const defaultMethod = methods.find((m) => m.is_default) || methods[0];
        if (defaultMethod) {
          setSelectedPaymentMethod(defaultMethod.id);
        }
      } catch (error) {
        console.error('Failed to fetch payment methods', error);
      } finally {
        setPaymentMethodsLoading(false);
      }
    };

    fetchPaymentMethodsData();
  }, [isAuthenticated]);

  // Calculate total
  const total = useMemo(() => {
    return selectedServices.reduce((sum, service) => {
      const price = typeof service.price === 'number' ? service.price : parseFloat(String(service.price || 0));
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
  }, [selectedServices]);

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

    // Validate card selection when paying with card
    if (paymentType === 'card' && !selectedPaymentMethod) {
      alert('Please select a payment card');
      return;
    }

    if (!isAuthenticated) {
      router.push(`/booking/${vendorId}/time`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data
      const orderData: Record<string, any> = {
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

      // Add payment method ID if paying with card
      if (paymentType === 'card' && selectedPaymentMethod) {
        orderData.payment_method_id = selectedPaymentMethod;
      }

      await api.post('/customer/orders', orderData);

      // Clear session storage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(`booking_${vendorId}_services`);
        sessionStorage.removeItem(`booking_${vendorId}_professional`);
        sessionStorage.removeItem(`booking_${vendorId}_date`);
        sessionStorage.removeItem(`booking_${vendorId}_time`);
      }

      // Show success message
      setShowSuccess(true);

      // Redirect to home page after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
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
          <p className="text-sm text-gray-500 mb-8">Redirecting to home page...</p>

          {/* Manual redirect button */}
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-[#6950f3] text-white rounded-xl font-medium hover:bg-[#5840d9] transition-colors"
          >
            Go to Home
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
                <button
                  className="text-sm font-medium text-[#6950f3] hover:opacity-80 transition-opacity flex items-center gap-1"
                  onClick={() => router.push('/customer/addresses/new')}
                >
                  <Plus className="h-4 w-4" />
                  Add new
                </button>
              </div>

              {addressesLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-20 bg-gray-100 rounded-xl"></div>
                  <div className="h-20 bg-gray-100 rounded-xl"></div>
                </div>
              ) : addresses.length === 0 ? (
                <div className="p-6 border-2 border-dashed border-gray-200 rounded-xl text-center">
                  <Home className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-3">No addresses found</p>
                  <button
                    onClick={() => router.push('/customer/addresses/new')}
                    className="text-sm font-medium text-[#6950f3] hover:opacity-80"
                  >
                    Add your first address
                  </button>
                </div>
              ) : (
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
              )}
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

                {/* Saved Cards - Show when card is selected */}
                {paymentType === 'card' && (
                  <div className="ml-8 space-y-2">
                    {paymentMethodsLoading ? (
                      <div className="animate-pulse space-y-2">
                        <div className="h-14 bg-gray-100 rounded-lg"></div>
                        <div className="h-14 bg-gray-100 rounded-lg"></div>
                      </div>
                    ) : paymentMethods.length === 0 ? (
                      <div className="p-4 border border-dashed border-gray-200 rounded-lg text-center">
                        <p className="text-sm text-gray-500 mb-2">No saved cards</p>
                        <button
                          onClick={() => router.push('/customer/settings/payments')}
                          className="text-sm font-medium text-[#6950f3] hover:opacity-80"
                        >
                          Add a card
                        </button>
                      </div>
                    ) : (
                      <>
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
                        <button
                          onClick={() => router.push('/customer/settings/payments')}
                          className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium text-[#6950f3] hover:bg-[#6950f3]/5 rounded-lg transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Add new card
                        </button>
                      </>
                    )}
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
          <BookingSidebar
            vendor={{ ...vendor, logo: vendor.logo ?? undefined }}
            selectedServices={selectedServices}
            total={total}
            onContinue={handleConfirm}
            continueDisabled={isSubmitting || !selectedAddress || (paymentType === 'card' && !selectedPaymentMethod)}
            continueLabel={isSubmitting ? 'Processing...' : 'Confirm Booking'}
            isLoading={isSubmitting}
            showDurationRange={false}
          >
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
          </BookingSidebar>
        </div>
      </div>
    </div>
  );
}
