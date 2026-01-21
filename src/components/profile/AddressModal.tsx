'use client';

import { useState, useEffect, useRef } from 'react';
import { X, MapPin, Navigation, Loader2 } from 'lucide-react';

interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    label: string;
    street_address: string;
    city: string;
    latitude: number | null;
    longitude: number | null;
  }) => void;
  editingAddress?: {
    id: string;
    label: string;
    street_address: string;
    city: string;
    latitude: number | null;
    longitude: number | null;
  } | null;
  isSubmitting?: boolean;
}

export function AddressModal({ isOpen, onClose, onSave, editingAddress, isSubmitting }: AddressModalProps) {
  const [addressName, setAddressName] = useState('');
  const [addressSearch, setAddressSearch] = useState('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens/closes or editing address changes
  useEffect(() => {
    if (isOpen) {
      if (editingAddress) {
        setAddressName(editingAddress.label);
        setAddressSearch(editingAddress.street_address);
        setSelectedLocation({
          display_name: editingAddress.street_address,
          lat: String(editingAddress.latitude || 0),
          lon: String(editingAddress.longitude || 0),
          address: {
            city: editingAddress.city,
          },
        });
      } else {
        setAddressName('');
        setAddressSearch('');
        setSelectedLocation(null);
        setSearchResults([]);
      }
      setError('');
    }
  }, [isOpen, editingAddress]);

  // Search for locations using Nominatim
  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
      setShowDropdown(true);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  const handleAddressChange = (value: string) => {
    setAddressSearch(value);
    setSelectedLocation(null);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(value);
    }, 300);
  };

  // Get current location
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await response.json();

          setSelectedLocation({
            display_name: data.display_name,
            lat: String(latitude),
            lon: String(longitude),
            address: data.address,
          });
          setAddressSearch(data.display_name);
          setShowDropdown(false);
        } catch (err) {
          console.error('Reverse geocode error:', err);
          setError('Could not get address for your location');
        } finally {
          setIsSearching(false);
        }
      },
      (err) => {
        setIsSearching(false);
        setError('Could not get your location. Please allow location access.');
      }
    );
  };

  // Select a location from search results
  const handleSelectLocation = (location: LocationResult) => {
    setSelectedLocation(location);
    setAddressSearch(location.display_name);
    setShowDropdown(false);
    setSearchResults([]);
  };

  // Clear selected location
  const handleClearLocation = () => {
    setSelectedLocation(null);
    setAddressSearch('');
    setSearchResults([]);
    inputRef.current?.focus();
  };

  // Handle save
  const handleSave = () => {
    if (!addressName.trim()) {
      setError('Address name is required');
      return;
    }

    if (!selectedLocation) {
      setError('Please select a location');
      return;
    }

    const city = selectedLocation.address?.city ||
                 selectedLocation.address?.town ||
                 selectedLocation.address?.village ||
                 selectedLocation.address?.state ||
                 '';

    onSave({
      label: addressName.trim(),
      street_address: selectedLocation.display_name,
      city: city,
      latitude: parseFloat(selectedLocation.lat),
      longitude: parseFloat(selectedLocation.lon),
    });
  };

  if (!isOpen) return null;

  const getShortAddress = () => {
    if (!selectedLocation) return '';
    const parts = selectedLocation.display_name.split(',');
    return parts.slice(0, 2).join(',').trim();
  };

  const getCityState = () => {
    if (!selectedLocation?.address) return '';
    const city = selectedLocation.address.city || selectedLocation.address.town || selectedLocation.address.village || '';
    const state = selectedLocation.address.state || '';
    return [city, state].filter(Boolean).join(', ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-[475px] min-h-[750px] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="h-6 w-6 text-gray-900" />
        </button>

        {/* Header */}
        <div className="pl-12 pr-8 pt-20 pb-9">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingAddress ? 'Edit address' : 'Add custom address'}
          </h2>
        </div>

        {/* Content */}
        <div className="pl-12 pr-8 flex-1 flex flex-col">
          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 mb-4">{error}</p>
          )}

          {/* Address Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Address name<span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-[#6950f3]">
              <input
                type="text"
                value={addressName}
                onChange={(e) => {
                  setAddressName(e.target.value);
                  setError('');
                }}
                placeholder="Address"
                className="w-full px-4 py-3 outline-none focus-visible:outline-none text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Address Search */}
          <div className="relative mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Address<span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#6950f3] [&_*]:outline-none [&_*]:focus-visible:outline-none">
              <div className="pl-4">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={addressSearch}
                onChange={(e) => handleAddressChange(e.target.value)}
                onFocus={() => !selectedLocation && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder="Start typing address"
                className="flex-1 px-3 py-3 text-gray-900 placeholder-gray-400"
              />
              {addressSearch && (
                <button
                  type="button"
                  onClick={handleClearLocation}
                  className="pr-4 hover:opacity-70 transition-opacity"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Dropdown with Use my location + Search Results */}
            {showDropdown && !selectedLocation && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] z-10 max-h-60 overflow-y-auto">
                {/* Use my location option */}
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={isSearching}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  {isSearching ? (
                    <Loader2 className="h-5 w-5 text-[#6950f3] animate-spin" />
                  ) : (
                    <Navigation className="h-5 w-5 text-[#6950f3]" />
                  )}
                  <span className="text-sm font-medium text-[#6950f3]">Use my location</span>
                </button>

                {/* Search results */}
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectLocation(result)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm text-gray-900 line-clamp-2">{result.display_name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Location Preview */}
          {selectedLocation && (
            <div className="border border-gray-200 rounded-lg overflow-hidden mb-4 flex-1">
              {/* Use my location option */}
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={isSearching}
                className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {isSearching ? (
                  <Loader2 className="h-5 w-5 text-[#6950f3] animate-spin" />
                ) : (
                  <Navigation className="h-5 w-5 text-[#6950f3]" />
                )}
                <span className="text-sm font-medium text-[#6950f3]">Use my location</span>
              </button>

              {/* Map placeholder */}
              <div className="h-40 bg-gray-100 relative flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-gray-900 mx-auto mb-2" />
                  <p className="text-xs bg-gray-800 text-white px-2 py-1 rounded">Drag the map to adjust the pin</p>
                </div>
                {/* Zoom controls */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                  <button className="w-8 h-8 bg-white rounded shadow flex items-center justify-center text-gray-600 hover:bg-gray-50">
                    +
                  </button>
                  <button className="w-8 h-8 bg-white rounded shadow flex items-center justify-center text-gray-600 hover:bg-gray-50">
                    -
                  </button>
                </div>
              </div>

              {/* Location info */}
              <div className="p-4 flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{getShortAddress()}</p>
                  <p className="text-sm text-gray-500">{getCityState()}</p>
                </div>
                <button
                  type="button"
                  onClick={handleClearLocation}
                  className="text-sm font-medium text-[#6950f3] hover:opacity-80"
                >
                  Edit
                </button>
              </div>
            </div>
          )}

          {/* Spacer to push button to bottom */}
          <div className="flex-1" />
        </div>

        {/* Save Button - Fixed at bottom */}
        <div className="px-10 pb-8 pt-4">
          <button
            onClick={handleSave}
            disabled={!addressName.trim() || !selectedLocation || isSubmitting}
            className="w-full py-3.5 bg-[#afafaf] text-white text-sm font-semibold rounded-full transition-colors disabled:cursor-not-allowed enabled:bg-gray-900 enabled:text-white enabled:hover:bg-gray-800"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </span>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
