'use client';

import dynamic from 'next/dynamic';

interface VendorMapProps {
  latitude: number;
  longitude: number;
  vendorName: string;
  address?: string;
}

// Loading placeholder
function MapPlaceholder() {
  return (
    <div className="w-full bg-gray-100 rounded-xl flex items-center justify-center h-[300px] md:h-[450px] lg:h-[500px]">
      <span className="text-gray-400">Loading map...</span>
    </div>
  );
}

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(
  () => import('./VendorMapClient').then((mod) => mod.VendorMapClient),
  {
    ssr: false,
    loading: () => <MapPlaceholder />,
  }
);

export function VendorMap({ latitude, longitude, vendorName, address }: VendorMapProps) {
  // Check if coordinates are valid
  if (!latitude || !longitude || latitude === 0 || longitude === 0) {
    return (
      <div className="w-full bg-gray-100 rounded-xl flex items-center justify-center h-[300px] md:h-[450px] lg:h-[500px]">
        <span className="text-gray-400">Location not available</span>
      </div>
    );
  }

  return (
    <MapComponent
      latitude={latitude}
      longitude={longitude}
      vendorName={vendorName}
      address={address}
    />
  );
}
