'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks';
import api from '@/lib/api';
import { ROUTES } from '@/config';
import Link from 'next/link';
import Image from 'next/image';
import { ProfileLayout } from '@/components/layout/ProfileLayout';

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
        setOrders(response.data.data || []);
      } catch (err: any) {
        console.error('Failed to fetch orders', err);
        setError(err.response?.data?.message || 'Failed to load appointments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  // Format date - "Wednesday, 22 January"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayName = dayNames[date.getDay()];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    return `${dayName}, ${day} ${month}`;
  };

  // Format time - "9:00 am"
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'pm' : 'am';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] pt-32">
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
        /* Appointments List */
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/customer/orders/${order.id}`}
              className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {/* Vendor Name */}
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {order.vendor?.name || 'Vendor'}
                  </h3>

                  {/* Services */}
                  {order.items && order.items.length > 0 && (
                    <p className="text-sm text-gray-600 mb-2">
                      {order.items.map(item => item.sub_service_name || item.service_name).join(', ')}
                    </p>
                  )}

                  {/* Date and Time */}
                  <p className="text-sm text-gray-500">
                    {order.scheduled_date && formatDate(order.scheduled_date)}
                    {order.scheduled_time && ` at ${formatTime(order.scheduled_time)}`}
                  </p>
                </div>

                <ChevronRight className="h-5 w-5 text-gray-400 shrink-0 ml-4" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </ProfileLayout>
  );
}
