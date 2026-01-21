'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks';
import api from '@/lib/api';
import { ROUTES } from '@/config';
import Link from 'next/link';
import Image from 'next/image';
import { ProfileLayout } from '@/components/layout/ProfileLayout';

interface OrderItem {
  id: string;
  service_name: string;
  sub_service_name: string;
  quantity: number;
  total_price: number;
  duration?: number;
}

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date: string;
  scheduled_time: string;
  total: number;
  vendor?: {
    id: string;
    name: string;
    logo?: string | null;
  };
  address?: {
    street_address?: string;
    building?: string;
    city?: string;
  };
  items?: OrderItem[];
  technician?: {
    id: string;
    name: string;
  };
  cancellation_policy?: string;
}

export default function AppointmentsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch orders
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get('/customer/orders', { params: { per_page: 50 } });
        const fetchedOrders = response.data.data || [];
        setOrders(fetchedOrders);
        // Auto-select first upcoming order, or first past order if no upcoming
        const upcoming = fetchedOrders.filter((o: Order) => !['completed', 'cancelled'].includes(o.status));
        const past = fetchedOrders.filter((o: Order) => ['completed', 'cancelled'].includes(o.status));
        if (upcoming.length > 0) {
          setSelectedOrder(upcoming[0]);
        } else if (past.length > 0) {
          setSelectedOrder(past[0]);
        }
      } catch (err: any) {
        console.error('Failed to fetch orders', err);
        setError(err.response?.data?.message || 'Failed to load appointments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  // Split orders into upcoming and past
  const upcomingOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter(o => ['completed', 'cancelled'].includes(o.status));

  // Check if selected order is a past order
  const isPastOrder = selectedOrder ? ['completed', 'cancelled'].includes(selectedOrder.status) : false;

  // Format date - "Today" or "Wednesday, 22 January"
  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayName = dayNames[date.getDay()];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    return `${dayName}, ${day} ${month}`;
  };

  // Format time - "4:30 pm"
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'pm' : 'am';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Get total duration
  const getTotalDuration = (items?: OrderItem[]) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((total, item) => total + (item.duration || 30), 0);
  };

  // Get status color and label
  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'confirmed':
        return { label: 'Confirmed', bgColor: 'bg-green-100', textColor: 'text-green-700', icon: 'check' };
      case 'pending':
        return { label: 'Pending', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', icon: 'check' };
      case 'in_progress':
        return { label: 'In Progress', bgColor: 'bg-blue-100', textColor: 'text-blue-700', icon: 'check' };
      case 'completed':
        return { label: 'Completed', bgColor: 'bg-gray-100', textColor: 'text-gray-700', icon: 'check' };
      case 'cancelled':
        return { label: 'No show', bgColor: 'bg-red-50', textColor: 'text-red-600', icon: 'noshow' };
      default:
        return { label: 'Unknown', bgColor: 'bg-gray-100', textColor: 'text-gray-700', icon: 'check' };
    }
  };

  // Get vendor image
  const getVendorImage = (vendor?: Order['vendor']) => {
    const logo = vendor?.logo;
    if (logo && (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('/'))) {
      return logo;
    }
    return null;
  };

  // Get vendor initials
  const getVendorInitials = (name?: string) => {
    if (!name) return 'V';
    const words = name.split(' ').filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get order location
  const getOrderLocation = (order: Order) => {
    if (order.address) {
      const parts = [order.address.street_address, order.address.building, order.address.city].filter(Boolean);
      return parts.join(', ') || 'Location not available';
    }
    return 'Location not available';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ProfileLayout>
      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading appointments...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-32">
          <div className="text-center max-w-md">
            <p className="text-red-600 text-sm mb-2">{error}</p>
            {error.includes('Customer access required') && (
              <p className="text-red-500 text-xs">
                It looks like your account doesn't have customer permissions. Please contact support or try logging out and registering again.
              </p>
            )}
          </div>
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] pt-16">
          <div className="text-center">
            <div className="mb-6">
              <Image
                src="/appointments/calendar.png"
                alt="No appointments"
                width={55}
                height={55}
                className="mx-auto"
              />
            </div>
            <h2 className="text-[20px] font-semibold leading-[28px] text-[rgb(20,20,20)] mb-2">
              No appointments yet
            </h2>
            <p className="text-[15px] font-normal leading-[20px] text-[rgb(118,118,118)] mb-6">
              Your upcoming and past appointments will appear when you book
            </p>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Start searching
            </Link>
          </div>
        </div>
      ) : (
        /* Two Column Layout */
        <div className="flex gap-16 ml-19">
          {/* Left Column - Appointments List */}
          <div className="w-[357px] shrink-0">
            <h1
              className="text-[28px] leading-[36px] text-[rgb(20,20,20)] mb-6"
              style={{ fontFamily: 'var(--font-roobert), sans-serif', fontWeight: 650 }}
            >
              Appointments
            </h1>

            {/* Upcoming Section */}
            <div className="mb-6 pt-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg font-semibold text-gray-900">Upcoming</span>
              </div>

              {upcomingOrders.length === 0 ? (
                /* Empty Upcoming State */
                <div className="border border-gray-200 rounded-lg p-8 text-center bg-[#f9f9f9]">
                  <div className="mb-4">
                    <Image
                      src="/appointments/calendar.png"
                      alt="No upcoming appointments"
                      width={56}
                      height={56}
                      className="mx-auto"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    No upcoming appointments
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Your upcoming appointments will appear here when you book
                  </p>
                  <Link
                    href="/"
                    className="inline-block px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    Search vendors
                  </Link>
                </div>
              ) : (
                /* Upcoming Appointment Cards */
                <div className="space-y-3">
                  {upcomingOrders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`w-full text-left flex rounded-lg border overflow-hidden transition-all bg-white ${
                        selectedOrder?.id === order.id
                          ? 'border-[#6C5CE7] ring-2 ring-[#6C5CE7]/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-32 h-28 shrink-0 bg-gradient-to-br from-[#6C5CE7] to-[#8B7CF7] flex items-center justify-center">
                        {getVendorImage(order.vendor) ? (
                          <img
                            src={getVendorImage(order.vendor)!}
                            alt={order.vendor?.name || 'Vendor'}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-2xl font-bold">
                            {getVendorInitials(order.vendor?.name)}
                          </span>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="flex-1 p-3">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">
                          {order.vendor?.name || 'Vendor'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">
                          {formatDateDisplay(order.scheduled_date)} at {formatTime(order.scheduled_time)}
                        </p>
                        <p className="text-sm text-gray-500">
                          AED {order.total} · {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Past Section */}
            {pastOrders.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-semibold text-gray-900">Past</span>
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 text-xs font-medium">
                    {pastOrders.length}
                  </span>
                </div>

                {/* Past Appointment Cards */}
                <div className="space-y-3">
                  {pastOrders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`w-full text-left flex rounded-lg border overflow-hidden transition-all bg-white ${
                        selectedOrder?.id === order.id
                          ? 'border-[#6C5CE7] ring-2 ring-[#6C5CE7]/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-32 shrink-0 bg-gradient-to-br from-[#6C5CE7] to-[#8B7CF7] flex items-center justify-center self-stretch">
                        {getVendorImage(order.vendor) ? (
                          <img
                            src={getVendorImage(order.vendor)!}
                            alt={order.vendor?.name || 'Vendor'}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-2xl font-bold">
                            {getVendorInitials(order.vendor?.name)}
                          </span>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="flex-1 p-3">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">
                          {order.vendor?.name || 'Vendor'}
                        </h3>
                        <p className="text-xs text-gray-600 mb-1">
                          {formatDateDisplay(order.scheduled_date)} at {formatTime(order.scheduled_time)}
                        </p>
                        <p className="text-xs text-gray-500 mb-1">
                          AED {order.total} · {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                        </p>
                        <Link
                          href={`/vendor/${order.vendor?.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-[#6C5CE7] font-medium hover:underline"
                        >
                          Book again
                        </Link>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Appointment Details */}
          {selectedOrder && (
            <div className="flex-1 max-w-xl bg-white border border-gray-200 rounded-xl overflow-hidden mt-[76px]">
              {/* Hero Image - Full Width */}
              <div className="relative h-80 bg-gradient-to-br from-[#6C5CE7] to-[#8B7CF7] flex items-center justify-center">
                {getVendorImage(selectedOrder.vendor) ? (
                  <img
                    src={getVendorImage(selectedOrder.vendor)!}
                    alt={selectedOrder.vendor?.name || 'Vendor'}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-8xl font-bold">
                    {getVendorInitials(selectedOrder.vendor?.name)}
                  </span>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                {/* Vendor Name */}
                <h2 className="absolute bottom-6 left-6 text-3xl font-bold text-white">
                  {selectedOrder.vendor?.name || 'Vendor'}
                </h2>
              </div>

              {/* Content below image */}
              <div className="pt-10 pl-10 pr-6 pb-6">

              {/* Status Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusInfo(selectedOrder.status).bgColor} ${getStatusInfo(selectedOrder.status).textColor}`}>
                  {getStatusInfo(selectedOrder.status).icon === 'noshow' ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {getStatusInfo(selectedOrder.status).label}
                </span>
              </div>

              {/* Date & Time */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatDateDisplay(selectedOrder.scheduled_date)} at {formatTime(selectedOrder.scheduled_time)}
                </h3>
                <p className="text-gray-600 mt-1">
                  {getTotalDuration(selectedOrder.items)} minutes duration
                </p>
              </div>

              {/* Action Items */}
              <div className="mb-8">
                {isPastOrder ? (
                  /* Past Order Actions - Book again & Venue details only */
                  <>
                    {/* Book again */}
                    <Link
                      href={`/vendor/${selectedOrder.vendor?.id}`}
                      className="w-full flex items-center gap-4 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-[#6C5CE7]/10 rounded-full flex items-center justify-center">
                        <Image src="/appointments/calendar-add.svg" alt="" width={20} height={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Book again</p>
                        <p className="text-sm text-gray-500">Book your next appointment</p>
                      </div>
                    </Link>
                    <div className="border-b border-gray-200 ml-14" />

                    {/* Venue details */}
                    <Link
                      href={`/vendor/${selectedOrder.vendor?.id}`}
                      className="w-full flex items-center gap-4 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-[#6C5CE7]/10 rounded-full flex items-center justify-center">
                        <Image src="/appointments/store.svg" alt="" width={20} height={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Venue details</p>
                        <p className="text-sm text-gray-500">{selectedOrder.vendor?.name || 'View vendor'}</p>
                      </div>
                    </Link>
                    <div className="border-b border-gray-200 ml-14" />
                  </>
                ) : (
                  /* Upcoming Order Actions - Full list */
                  <>
                    {/* Add to calendar */}
                    <button className="w-full flex items-center gap-4 py-4 hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 bg-[#6C5CE7]/10 rounded-full flex items-center justify-center">
                        <Image src="/appointments/calendar-add.svg" alt="" width={20} height={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Add to calendar</p>
                        <p className="text-sm text-gray-500">Set yourself a reminder</p>
                      </div>
                    </button>
                    <div className="border-b border-gray-200 ml-14" />

                    {/* Getting there */}
                    <button className="w-full flex items-center gap-4 py-4 hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 bg-[#6C5CE7]/10 rounded-full flex items-center justify-center">
                        <Image src="/appointments/cursor.svg" alt="" width={20} height={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Getting there</p>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {getOrderLocation(selectedOrder)}
                        </p>
                      </div>
                    </button>
                    <div className="border-b border-gray-200 ml-14" />

                    {/* Manage appointment */}
                    <button className="w-full flex items-center gap-4 py-4 hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 bg-[#6C5CE7]/10 rounded-full flex items-center justify-center">
                        <Image src="/appointments/calendar.svg" alt="" width={20} height={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Manage appointment</p>
                        <p className="text-sm text-gray-500">Reschedule or cancel your appointment</p>
                      </div>
                    </button>
                    <div className="border-b border-gray-200 ml-14" />

                    {/* Venue details */}
                    <Link
                      href={`/vendor/${selectedOrder.vendor?.id}`}
                      className="w-full flex items-center gap-4 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-[#6C5CE7]/10 rounded-full flex items-center justify-center">
                        <Image src="/appointments/store.svg" alt="" width={20} height={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Venue details</p>
                        <p className="text-sm text-gray-500">{selectedOrder.vendor?.name || 'View vendor'}</p>
                      </div>
                    </Link>
                    <div className="border-b border-gray-200 ml-14" />
                  </>
                )}
              </div>

              {/* Overview Section */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Overview</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.sub_service_name || item.service_name}
                        </p>
                        <p className="text-sm text-gray-500">{item.duration || 30} mins</p>
                      </div>
                      <p className="font-medium text-gray-900">AED {item.total_price}</p>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4" />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <p className="font-bold text-gray-900">Total</p>
                  <p className="font-bold text-gray-900">AED {selectedOrder.total}</p>
                </div>
              </div>

              {/* Cancellation Policy - Only for upcoming orders */}
              {!isPastOrder && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Cancellation policy</h4>
                  <p className="text-gray-600">
                    {selectedOrder.cancellation_policy || 'Cancel for free anytime.'}
                  </p>
                </div>
              )}

              {/* Booking Reference */}
              <p className="text-sm text-gray-500">
                Booking ref: {selectedOrder.order_number}
              </p>
              </div>
            </div>
          )}
        </div>
      )}
    </ProfileLayout>
  );
}
