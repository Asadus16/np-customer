'use client';

import { Clock } from 'lucide-react';

export interface ServiceItemFresha {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // in minutes
}

export interface ServiceGroupFresha {
  id: string;
  name: string;
  services: ServiceItemFresha[];
}

interface ServiceListFreshaProps {
  groups: ServiceGroupFresha[];
  activeGroupId: string;
  onBookService: (service: ServiceItemFresha) => void;
}

export function ServiceListFresha({
  groups,
  activeGroupId,
  onBookService,
}: ServiceListFreshaProps) {
  // Get the active group
  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];

  if (!activeGroup) {
    return (
      <div className="text-center py-8 text-gray-500">
        No services available
      </div>
    );
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <div className="space-y-1">
      {activeGroup.services.map((service) => (
        <div
          key={service.id}
          className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors"
        >
          {/* Service info */}
          <div className="flex-1 min-w-0 pr-4">
            <h4 className="font-medium text-gray-900">{service.name}</h4>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(service.duration)}
              </span>
              {service.description && (
                <span className="text-sm text-gray-500 truncate">
                  {service.description}
                </span>
              )}
            </div>
          </div>

          {/* Price and Book button */}
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-900">
              AED {service.price}
            </span>
            <button
              onClick={() => onBookService(service)}
              className="px-6 py-2 border border-gray-900 text-gray-900 rounded-full text-sm font-medium hover:bg-gray-900 hover:text-white transition-colors"
            >
              Book
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
