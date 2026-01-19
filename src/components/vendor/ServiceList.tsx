'use client';

export interface Service {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  price: number;
  priceFrom?: boolean;
  duration: number; // in minutes
  durationMax?: number; // max duration for range
  serviceCount?: number; // number of services in package
  discount?: number; // discount percentage
  image?: string;
  isPopular?: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  services: Service[];
}

interface ServiceListProps {
  services: Service[];
  onBookService?: (service: Service) => void;
}

export function ServiceList({ services, onBookService }: ServiceListProps) {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr, ${mins} mins`;
  };

  const formatDurationRange = (min: number, max?: number) => {
    if (!max || min === max) return formatDuration(min);
    return `${formatDuration(min)} - ${formatDuration(max)}`;
  };

  return (
    <div className="space-y-3">
      {services.map((service) => (
        <div
          key={service.id}
          className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between gap-4">
            {/* Service Info */}
            <div className="flex-1 min-w-0">
              {/* Service Name */}
              <h3 className="text-lg font-semibold text-gray-900">
                {service.name}
                {service.nameAr && (
                  <span className="text-gray-500 font-normal"> - {service.nameAr}</span>
                )}
              </h3>

              {/* Duration & Service Count */}
              <p className="text-sm text-gray-500 mt-1">
                {formatDurationRange(service.duration, service.durationMax)}
                {service.serviceCount && (
                  <span>  •  {service.serviceCount} services</span>
                )}
              </p>

              {/* Price & Discount */}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-sm font-medium text-gray-900">
                  SAR {service.price}
                </span>
                {service.discount && (
                  <span className="text-green-600 font-medium text-xs">
                    Save {service.discount}%
                  </span>
                )}
              </div>
            </div>

            {/* Book Button */}
            <button
              onClick={() => onBookService?.(service)}
              className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors shrink-0"
            >
              Book
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Legacy ServiceList with accordion - kept for backward compatibility
interface LegacyServiceListProps {
  categories: ServiceCategory[];
  selectedServices: { service: Service; quantity: number }[];
  onServiceToggle: (service: Service) => void;
  onQuantityChange: (serviceId: string, delta: number) => void;
}

export function LegacyServiceList({
  categories,
  selectedServices,
  onServiceToggle,
  onQuantityChange,
}: LegacyServiceListProps) {
  return null;
}
