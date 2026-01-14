'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, ShoppingCart, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { Service } from './ServiceList';

interface BookingCardProps {
  vendorId: string;
  vendorName: string;
  selectedServices: { service: Service; quantity: number }[];
  onRemoveService: (serviceId: string) => void;
}

export function BookingCard({
  vendorId,
  vendorName,
  selectedServices,
  onRemoveService,
}: BookingCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate totals
  const subtotal = selectedServices.reduce(
    (sum, { service, quantity }) => sum + service.price * quantity,
    0
  );
  const totalDuration = selectedServices.reduce(
    (sum, { service, quantity }) => sum + service.duration * quantity,
    0
  );
  const itemCount = selectedServices.reduce((sum, { quantity }) => sum + quantity, 0);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  };

  const handleCheckout = () => {
    // Navigate to checkout with cart data
    router.push(`/checkout?vendor=${vendorId}`);
  };

  // Empty state
  if (selectedServices.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
        <div className="text-center py-8">
          <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No services selected</p>
          <p className="text-sm text-gray-400">
            Browse services and add them to start booking
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Your Booking</h3>
          <span className="text-sm text-gray-500">
            {itemCount} {itemCount === 1 ? 'service' : 'services'}
          </span>
        </div>
      </div>

      {/* Selected Services */}
      <div className="max-h-64 overflow-y-auto">
        {selectedServices.map(({ service, quantity }) => (
          <div
            key={service.id}
            className="flex items-center justify-between p-4 border-b border-gray-100"
          >
            <div className="flex-1 min-w-0 mr-3">
              <p className="font-medium text-gray-900 truncate">{service.name}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Qty: {quantity}</span>
                <span>•</span>
                <span>{service.duration * quantity} min</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-900">
                AED {service.price * quantity}
              </span>
              <button
                onClick={() => onRemoveService(service.id)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="p-4 bg-gray-50 space-y-3">
        {/* Duration */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Estimated Duration</span>
          </div>
          <span className="font-medium text-gray-900">
            {formatDuration(totalDuration)}
          </span>
        </div>

        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm border-t border-gray-200 pt-3">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">AED {subtotal}</span>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="text-xl font-bold text-gray-900">AED {subtotal}</span>
        </div>

        {/* Checkout Button */}
        <Button
          onClick={handleCheckout}
          className="w-full mt-4"
          size="lg"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Continue to Schedule
        </Button>

        <p className="text-xs text-center text-gray-500">
          You won&apos;t be charged yet
        </p>
      </div>
    </div>
  );
}

// Mobile Bottom Bar version
export function MobileBookingBar({
  selectedServices,
  onViewCart,
}: {
  selectedServices: { service: Service; quantity: number }[];
  onViewCart: () => void;
}) {
  const subtotal = selectedServices.reduce(
    (sum, { service, quantity }) => sum + service.price * quantity,
    0
  );
  const itemCount = selectedServices.reduce((sum, { quantity }) => sum + quantity, 0);

  if (selectedServices.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg md:hidden z-50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {itemCount} {itemCount === 1 ? 'service' : 'services'} selected
          </p>
          <p className="text-lg font-bold text-gray-900">AED {subtotal}</p>
        </div>
        <Button onClick={onViewCart} size="lg">
          <ShoppingCart className="h-4 w-4 mr-2" />
          View Cart
        </Button>
      </div>
    </div>
  );
}
