'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Clock, Plus, Check, ChevronDown, ChevronUp } from 'lucide-react';

export interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  image?: string;
  isPopular?: boolean;
}

export interface ServiceGroup {
  id: string;
  name: string;
  services: ServiceItem[];
}

interface ServicesSectionProps {
  serviceGroups: ServiceGroup[];
  selectedServices: string[];
  onServiceSelect: (serviceId: string) => void;
}

export function ServicesSection({
  serviceGroups,
  selectedServices,
  onServiceSelect,
}: ServicesSectionProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    serviceGroups.length > 0 ? [serviceGroups[0].id] : []
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const isSelected = (serviceId: string) => selectedServices.includes(serviceId);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <div className="space-y-4">
      {serviceGroups.map((group) => {
        const isExpanded = expandedGroups.includes(group.id);
        const selectedCount = group.services.filter((s) =>
          selectedServices.includes(s.id)
        ).length;

        return (
          <div
            key={group.id}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
          >
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(group.id)}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                <span className="text-sm text-gray-500">
                  {group.services.length} {group.services.length === 1 ? 'service' : 'services'}
                </span>
                {selectedCount > 0 && (
                  <span className="px-2 py-0.5 bg-gray-900 text-white text-xs font-medium rounded-full">
                    {selectedCount} selected
                  </span>
                )}
              </div>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {/* Services List */}
            {isExpanded && (
              <div className="border-t border-gray-100">
                {group.services.map((service, index) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    isSelected={isSelected(service.id)}
                    onSelect={() => onServiceSelect(service.id)}
                    isLast={index === group.services.length - 1}
                    formatDuration={formatDuration}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface ServiceCardProps {
  service: ServiceItem;
  isSelected: boolean;
  onSelect: () => void;
  isLast: boolean;
  formatDuration: (minutes: number) => string;
}

function ServiceCard({
  service,
  isSelected,
  onSelect,
  isLast,
  formatDuration,
}: ServiceCardProps) {
  return (
    <div
      className={`flex gap-4 p-5 transition-colors cursor-pointer ${
        !isLast ? 'border-b border-gray-100' : ''
      } ${isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
      onClick={onSelect}
    >
      {/* Service Image */}
      {service.image && (
        <div className="relative h-24 w-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
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
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-900">{service.name}</h4>
              {service.isPopular && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  Popular
                </span>
              )}
            </div>
            {service.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {service.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(service.duration)}</span>
              </div>
            </div>
          </div>

          {/* Price & Select Button */}
          <div className="flex flex-col items-end gap-2">
            <span className="text-lg font-bold text-gray-900">
              AED {service.price}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                isSelected
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isSelected ? (
                <Check className="h-5 w-5" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
