'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, MapPin, Building2, CreditCard, Tag, FileText, X, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks';
import api from '@/lib/api';
import { ROUTES } from '@/config';
import Link from 'next/link';

interface OrderItem {
  id: string;
  service_name: string;
  sub_service_name: string;
  unit_price: number;
  quantity: number;
  duration_minutes: number;
  total_price: number;
}

interface Address {
  id: string;
  label: string;
  street_address: string;
  building?: string;
  apartment?: string;
  city: string;
  emirate?: string;
}

interface Technician {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Vendor {
  id: string;
  name: string;
  email?: string;
}

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  payment_status: string;
  payment_type: string;
  subtotal: number;
  discount_amount: number;
  points_discount?: number;
  points_redeemed?: number;
  points_earned?: number;
  tax: number;
  total: number;
  scheduled_date: string;
  scheduled_time: string;
  total_duration_minutes: number;
  notes?: string;
  cancellation_reason?: string;
  cancelled_by?: string;
  refund_amount?: number;
  vendor?: Vendor;
  technician?: Technician;
  address?: Address;
  payment_method?: any;
  coupon?: {
    id: string;
    code: string;
    discount: number;
  };
  items?: OrderItem[];
  refund_request?: any;
  confirmed_at?: string;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  created_at: string;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch order details
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    const fetchOrder = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/customer/orders/${orderId}`);
        setOrder(response.data.data);
      } catch (err: any) {
        console.error('Failed to fetch order', err);
        if (err.response?.status === 404) {
          setError('Order not found');
        } else if (err.response?.status === 403) {
          setError('You do not have permission to view this order');
        } else {
          setError(err.response?.data?.message || 'Failed to load order details');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, isAuthenticated, authLoading]);

  // Handle cancel order
  const handleCancelOrder = async () => {
    if (!order) return;

    setIsCancelling(true);
    try {
      await api.post(`/customer/orders/${order.id}/cancel`, {
        reason: cancelReason || undefined,
      });
      // Refresh order data
      const response = await api.get(`/customer/orders/${orderId}`);
      setOrder(response.data.data);
      setShowCancelModal(false);
      setCancelReason('');
    } catch (err: any) {
      console.error('Failed to cancel order', err);
      alert(err.response?.data?.message || 'Failed to cancel order. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayName = dayNames[date.getDay()];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName}, ${day} ${month} ${year}`;
  };

  // Format time
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'pm' : 'am';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} mins`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} hr${hours > 1 ? 's' : ''}`;
    }
    return `${hours} hr${hours > 1 ? 's' : ''}, ${mins} mins`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  // Format address
  const formatAddress = (address?: Address) => {
    if (!address) return 'Address not available';
    const parts = [
      address.street_address,
      address.building,
      address.apartment,
      address.city,
      address.emirate,
    ].filter(Boolean);
    return parts.join(', ');
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link
            href="/appointments"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Appointments
          </Link>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
            <Link
              href="/appointments"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              View All Appointments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canCancel = order.status === 'pending' || order.status === 'confirmed';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/appointments"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Appointments
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Details</h1>
              <p className="text-gray-600">Order #{order.order_number}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vendor Info */}
            {order.vendor && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Vendor</h2>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{order.vendor.name}</h3>
                    {order.vendor.email && (
                      <p className="text-sm text-gray-600">{order.vendor.email}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Services */}
            {order.items && order.items.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Services</h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {item.sub_service_name || item.service_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.service_name} • {formatDuration(item.duration_minutes)} • Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {item.total_price.toFixed(2)} AED
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-500">
                            {item.unit_price.toFixed(2)} AED each
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h2>
              <div className="space-y-3">
                {order.scheduled_date && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span>{formatDate(order.scheduled_date)}</span>
                  </div>
                )}
                {order.scheduled_time && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span>{formatTime(order.scheduled_time)}</span>
                    {order.total_duration_minutes > 0 && (
                      <span className="text-gray-500">• {formatDuration(order.total_duration_minutes)}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Technician */}
            {order.technician && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Technician</h2>
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{order.technician.name}</p>
                    {order.technician.phone && (
                      <p className="text-sm text-gray-600">{order.technician.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Address */}
            {order.address && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">{order.address.label}</p>
                    <p className="text-sm text-gray-600">{formatAddress(order.address)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Booking Notes
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
              </div>
            )}

            {/* Cancellation Info */}
            {order.status === 'cancelled' && order.cancellation_reason && (
              <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                <h2 className="text-lg font-semibold text-red-900 mb-2">Cancellation Details</h2>
                <p className="text-red-800 mb-2">{order.cancellation_reason}</p>
                {order.cancelled_at && (
                  <p className="text-sm text-red-600">
                    Cancelled on {formatDate(order.cancelled_at.split(' ')[0])} at {formatTime(order.cancelled_at.split(' ')[1] || '')}
                  </p>
                )}
                {order.refund_amount && order.refund_amount > 0 && (
                  <p className="text-sm text-red-800 font-medium mt-2">
                    Refund Amount: {order.refund_amount.toFixed(2)} AED
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{order.subtotal.toFixed(2)} AED</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600">-{order.discount_amount.toFixed(2)} AED</span>
                  </div>
                )}
                {order.points_discount && order.points_discount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Points Discount</span>
                    <span className="text-green-600">-{order.points_discount.toFixed(2)} AED</span>
                  </div>
                )}
                {order.coupon && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      Coupon ({order.coupon.code})
                    </span>
                    <span className="text-green-600">-{order.coupon.discount.toFixed(2)} AED</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">{order.tax.toFixed(2)} AED</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-gray-900">
                      {order.total.toFixed(2)} AED
                    </span>
                  </div>
                </div>
                {order.points_earned && order.points_earned > 0 && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Points Earned: <span className="font-medium text-gray-900">{order.points_earned}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Payment Type</span>
                  <span className="text-gray-900 capitalize">{order.payment_type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`font-medium ${
                    order.payment_status === 'paid' ? 'text-green-600' :
                    order.payment_status === 'pending' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>
                    {order.payment_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full py-3 px-4 bg-red-50 text-red-700 border border-red-200 rounded-lg font-medium hover:bg-red-100 transition-colors"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cancel Order</h3>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please let us know why you're cancelling..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isCancelling}
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cancelling...
                  </span>
                ) : (
                  'Cancel Order'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
