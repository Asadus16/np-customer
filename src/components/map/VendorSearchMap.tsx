'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

interface VendorMapData {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  rating: number;
}

interface VendorSearchMapProps {
  vendors: VendorMapData[];
  hoveredVendorId: string | null;
  onMarkerHover: (id: string | null) => void;
  onMarkerClick: (id: string) => void;
}

// Loading component
function MapLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  );
}

// Dynamically import the map component to avoid SSR issues with Leaflet
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => <MapLoading />,
});

export function VendorSearchMap(props: VendorSearchMapProps) {
  return <LeafletMap {...props} />;
}
