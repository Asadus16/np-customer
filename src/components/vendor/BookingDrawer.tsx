'use client';

import { useEffect } from 'react';
import { X, Clock, Trash2, Calendar, ChevronRight } from 'lucide-react';
import { ServiceItem } from './ServicesSection';

interface BookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedServices: ServiceItem[];
  onRemoveService: (serviceId: string) => void;
  onContinue: () => void;
  vendorName: string;
}

export function BookingDrawer({
  isOpen,
  onClose,
  selectedServices,
  onRemoveService,
  onContinue,
  vendorName,
}: BookingDrawerProps) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Your Booking</h2>
            <p className="text-sm text-gray-500">{vendorName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-2">No services selected</p>
              <p className="text-gray-500 text-sm">
                Browse services and add them to start your booking
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {selectedServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-gray-50 rounded-xl p-4 flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900">{service.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formatDuration(service.duration)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">AED {service.price}</span>
                    <button
                      onClick={() => onRemoveService(service.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedServices.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-white space-y-4">
            {/* Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {selectedServices.length} {selectedServices.length === 1 ? 'service' : 'services'}
                </span>
                <span className="text-gray-500">{formatDuration(totalDuration)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">AED {totalPrice}</span>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={onContinue}
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight className="h-5 w-5" />
            </button>

            <p className="text-xs text-center text-gray-400">
              You won&apos;t be charged yet
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// Floating Book Button for mobile
export function FloatingBookButton({
  selectedCount,
  totalPrice,
  onClick,
}: {
  selectedCount: number;
  totalPrice: number;
  onClick: () => void;
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg md:hidden z-40">
      <button
        onClick={onClick}
        className="w-full py-4 bg-gray-900 text-white rounded-xl font-semibold flex items-center justify-between px-6"
      >
        <span>
          View booking ({selectedCount} {selectedCount === 1 ? 'service' : 'services'})
        </span>
        <span>AED {totalPrice}</span>
      </button>
    </div>
  );
}
