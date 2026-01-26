'use client';

import { useState, useEffect } from 'react';
import { X, Heart, MapPin, Star } from 'lucide-react';
import { SearchFilters } from '@/hooks/useVendorSearch';

interface VendorFiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onSortChange: (sort: string) => void;
  onClearFilters: () => void;
}

const MAX_PRICE = 10000; // Maximum price in AED

export function VendorFiltersDrawer({
  isOpen,
  onClose,
  filters,
  onSortChange,
  onClearFilters,
}: VendorFiltersDrawerProps) {
  const [localSort, setLocalSort] = useState(filters.sort || 'best_match');
  const [localMaxPrice, setLocalMaxPrice] = useState(MAX_PRICE);

  // Sync local state with filters when drawer opens
  useEffect(() => {
    if (isOpen) {
      setLocalSort(filters.sort || 'best_match');
    }
  }, [isOpen, filters]);

  const handleApply = () => {
    if (localSort !== filters.sort) {
      onSortChange(localSort);
    }
    onClose();
  };

  const handleClear = () => {
    setLocalSort('best_match');
    setLocalMaxPrice(MAX_PRICE);
    onClearFilters();
    onClose();
  };

  if (!isOpen) return null;

  const sortOptions = [
    { value: 'best_match', label: 'Best match', icon: Heart },
    { value: 'nearest', label: 'Nearest', icon: MapPin },
    { value: 'top_rated', label: 'Top rated', icon: Star },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal - Centered */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-[480px] max-h-[90vh] flex flex-col shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5">
            <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-8">
            {/* Sort by */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">Sort by</h3>
              <div className="grid grid-cols-3 gap-3">
                {sortOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = localSort === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setLocalSort(option.value)}
                      className={`flex flex-col items-center justify-center py-5 px-3 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-white'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 mb-2 ${
                          isSelected ? 'text-gray-900' : 'text-gray-400'
                        }`}
                        strokeWidth={isSelected ? 2 : 1.5}
                      />
                      <span
                        className={`text-sm ${
                          isSelected ? 'font-medium text-gray-900' : 'text-gray-600'
                        }`}
                      >
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Maximum price */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Maximum price</h3>
                <span className="text-base font-medium text-gray-900">
                  AED {localMaxPrice.toLocaleString()}
                </span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max={MAX_PRICE}
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
                  className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                  style={{
                    background: `linear-gradient(to right, #4F46E5 0%, #4F46E5 ${(localMaxPrice / MAX_PRICE) * 100}%, #E5E7EB ${(localMaxPrice / MAX_PRICE) * 100}%, #E5E7EB 100%)`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200">
            <button
              onClick={handleClear}
              className="flex-1 py-3.5 rounded-full border border-gray-300 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear all
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-3.5 rounded-full bg-gray-900 text-white text-base font-medium hover:bg-gray-800 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Custom slider styles */}
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #4F46E5;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }
        input[type='range']::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #4F46E5;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </>
  );
}
