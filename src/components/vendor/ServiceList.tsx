'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Clock, ChevronDown, ChevronUp, Plus, Minus, Check } from 'lucide-react';

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // in minutes
  image?: string;
  isPopular?: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  services: Service[];
}

interface ServiceListProps {
  categories: ServiceCategory[];
  selectedServices: { service: Service; quantity: number }[];
  onServiceToggle: (service: Service) => void;
  onQuantityChange: (serviceId: string, delta: number) => void;
}

export function ServiceList({
  categories,
  selectedServices,
  onServiceToggle,
  onQuantityChange,
}: ServiceListProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    categories.length > 0 ? [categories[0].id] : []
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some((s) => s.service.id === serviceId);
  };

  const getServiceQuantity = (serviceId: string) => {
    return selectedServices.find((s) => s.service.id === serviceId)?.quantity || 0;
  };

  return (
    <div className="space-y-4" id="services">
      <h2 className="text-lg font-semibold text-gray-900">Services Offered</h2>

      {categories.map((category) => {
        const isExpanded = expandedCategories.includes(category.id);

        return (
          <div
            key={category.id}
            className="border border-gray-200 rounded-xl overflow-hidden"
          >
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                <span className="text-sm text-gray-500">
                  ({category.services.length} services)
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {/* Services */}
            {isExpanded && (
              <div className="divide-y divide-gray-100">
                {category.services.map((service) => {
                  const isSelected = isServiceSelected(service.id);
                  const quantity = getServiceQuantity(service.id);

                  return (
                    <div
                      key={service.id}
                      className={`p-4 transition-colors ${
                        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex gap-4">
                        {/* Service Image */}
                        {service.image && (
                          <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={service.image}
                              alt={service.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        {/* Service Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900">
                                  {service.name}
                                </h4>
                                {service.isPopular && (
                                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                                    Popular
                                  </span>
                                )}
                              </div>
                              {service.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                  {service.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-2">
                                <span className="font-medium text-gray-900">
                                  AED {service.price}
                                </span>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{service.duration} min</span>
                                </div>
                              </div>
                            </div>

                            {/* Add/Remove Button */}
                            <div className="flex-shrink-0">
                              {isSelected ? (
                                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg">
                                  <button
                                    onClick={() =>
                                      onQuantityChange(service.id, -1)
                                    }
                                    className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
                                  >
                                    <Minus className="h-4 w-4 text-gray-600" />
                                  </button>
                                  <span className="w-8 text-center font-medium text-gray-900">
                                    {quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      onQuantityChange(service.id, 1)
                                    }
                                    className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
                                  >
                                    <Plus className="h-4 w-4 text-gray-600" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => onServiceToggle(service)}
                                  className="flex items-center gap-1 px-4 py-2 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-colors text-sm font-medium"
                                >
                                  <Plus className="h-4 w-4" />
                                  Add
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
