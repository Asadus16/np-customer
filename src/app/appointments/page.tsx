'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Building2, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks';
import api from '@/lib/api';
import { ROUTES } from '@/config';
import Link from 'next/link';

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
  };
  items?: Array<{
    id: string;
    service_name: string;
    sub_service_name: string;
    quantity: number;
    total_price: number;
  }>;
  technician?: {
    id: string;
    name: string;
  };
}

export default function AppointmentsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'>('all');

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
        const params: any = { per_page: 50 };
        if (filter !== 'all') {
          params.status = filter;
        }
        const response = await api.get('/customer/orders', { params });
        setOrders(response.data.data || []);
      } catch (err: any) {
        console.error('Failed to fetch orders', err);
        setError(err.response?.data?.message || 'Failed to load appointments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, filter]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayName = dayNames[date.getDay()];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    return `${dayName}, ${day} ${month}`;
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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointments</h1>
          <p className="text-gray-600">View and manage your upcoming and past appointments</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {(['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : getStatusLabel(status)}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm mb-2">{error}</p>
            {error.includes('Customer access required') && (
              <p className="text-red-700 text-xs">
                It looks like your account doesn't have customer permissions. Please contact support or try logging out and registering again.
              </p>
            )}
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You don't have any appointments yet."
                : `You don't have any ${getStatusLabel(filter).toLowerCase()} appointments.`}
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/customer/orders/${order.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Order Info */}
                  <div className="flex-1 min-w-0">
                    {/* Vendor Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {order.vendor?.name || 'Vendor'}
                        </h3>
                        <p className="text-sm text-gray-500">Order #{order.order_number}</p>
                      </div>
                    </div>

                    {/* Services */}
                    {order.items && order.items.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {order.items.map(item => item.sub_service_name || item.service_name).join(', ')}
                        </p>
                        {order.items.length > 1 && (
                          <p className="text-xs text-gray-500">
                            {order.items.length} services
                          </p>
                        )}
                      </div>
                    )}

                    {/* Date and Time */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      {order.scheduled_date && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(order.scheduled_date)}</span>
                        </div>
                      )}
                      {order.scheduled_time && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(order.scheduled_time)}</span>
                        </div>
                      )}
                    </div>

                    {/* Technician */}
                    {order.technician && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
                        <Building2 className="h-4 w-4" />
                        <span>{order.technician.name}</span>
                      </div>
                    )}

                    {/* Status and Price */}
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {typeof order.total === 'number' ? order.total.toFixed(2) : parseFloat(String(order.total || 0)).toFixed(2)} AED
                      </span>
                    </div>
                  </div>

                  {/* Right: Arrow */}
                  <div className="shrink-0">
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
