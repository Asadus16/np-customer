'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/hooks';

interface OrderItem {
  id: string;
  service_name: string;
  sub_service_name: string;
  total_price: number;
}

interface PastOrder {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  total: number;
  vendor?: {
    id: string;
    name: string;
    logo?: string | null;
  };
  items?: OrderItem[];
}

export function BookAgainSection() {
  const { isAuthenticated } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [pastOrders, setPastOrders] = useState<PastOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch past orders
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const fetchPastOrders = async () => {
      try {
        const response = await api.get('/customer/orders', { params: { per_page: 10 } });
        const orders = response.data.data || [];
        // Filter only completed orders
        const completed = orders.filter((o: any) => o.status === 'completed');
        // Remove duplicates by vendor id, keeping the most recent
        const uniqueVendors = new Map<string, PastOrder>();
        completed.forEach((order: any) => {
          if (order.vendor?.id && !uniqueVendors.has(order.vendor.id)) {
            uniqueVendors.set(order.vendor.id, order);
          }
        });
        setPastOrders(Array.from(uniqueVendors.values()));
      } catch (err) {
        console.error('Failed to fetch past orders', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPastOrders();
  }, [isAuthenticated]);

  // Check scroll position
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setScrollPosition(scrollLeft);
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, [checkScrollPosition, pastOrders]);

  const handleScroll = useCallback((direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 350;
    const newPosition = direction === 'left'
      ? scrollPosition - scrollAmount
      : scrollPosition + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth',
    });
  }, [scrollPosition]);

  // Format date - "Tue, 20 Jan 2026"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Format time - "4:30 pm"
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'pm' : 'am';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes}${ampm}`;
  };

  // Get vendor image
  const getVendorImage = (vendor?: PastOrder['vendor']) => {
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

  // Get services text
  const getServicesText = (items?: OrderItem[]) => {
    if (!items || items.length === 0) return '';
    const serviceNames = items.map(item => item.sub_service_name || item.service_name);
    return serviceNames.join(', ');
  };

  // Don't render if not authenticated or no past orders
  if (!isAuthenticated || isLoading || pastOrders.length === 0) {
    return null;
  }

  return (
    <section className="py-4 lg:py-8">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Book again</h2>
        </div>

        {/* Scrollable Container */}
        <div className="relative">
          {/* Left Scroll Button - Desktop only */}
          {canScrollLeft && (
            <button
              onClick={() => handleScroll('left')}
              className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all items-center justify-center"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
          )}

          {/* Past Order Cards */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollPosition}
            className="flex gap-3 lg:gap-4 overflow-x-auto hide-scrollbar scroll-smooth pb-2"
          >
            {pastOrders.map((order) => (
              <div
                key={order.id}
                className="flex-shrink-0 w-[320px] lg:w-[380px] bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div className="flex">
                  {/* Vendor Image */}
                  <div className="relative w-[100px] lg:w-[120px] h-[120px] lg:h-[140px] shrink-0 bg-gradient-to-br from-[#6C5CE7] to-[#8B7CF7] flex items-center justify-center">
                    {getVendorImage(order.vendor) ? (
                      <img
                        src={getVendorImage(order.vendor)!}
                        alt={order.vendor?.name || 'Vendor'}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xl lg:text-2xl font-bold">
                        {getVendorInitials(order.vendor?.name)}
                      </span>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="flex-1 p-3 lg:p-4 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm lg:text-base mb-1 line-clamp-1">
                        {order.vendor?.name || 'Vendor'}
                      </h3>
                      <p className="text-xs lg:text-sm text-gray-600 mb-1">
                        {formatDate(order.scheduled_date)} at {formatTime(order.scheduled_time)}
                      </p>
                      <p className="text-xs lg:text-sm text-gray-500 line-clamp-1">
                        AED {order.total} · {getServicesText(order.items)}
                      </p>
                    </div>
                    <Link
                      href={`/vendor/${order.vendor?.id}`}
                      className="text-[#6C5CE7] text-sm font-medium hover:underline mt-2"
                    >
                      Book again
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Scroll Button - Desktop only */}
          {canScrollRight && (
            <button
              onClick={() => handleScroll('right')}
              className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all items-center justify-center"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
