'use client';

import { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface VendorMapData {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  rating: number;
}

interface LeafletMapProps {
  vendors: VendorMapData[];
  hoveredVendorId: string | null;
  onMarkerHover: (id: string | null) => void;
  onMarkerClick: (id: string) => void;
}

// Default center (Karachi)
const DEFAULT_CENTER: [number, number] = [24.8607, 67.0011];
const DEFAULT_ZOOM = 12;

// Create custom marker icon with pin SVG and rating
function createPinIcon(rating: number, isHighlighted: boolean) {
  const scale = isHighlighted ? 1.3 : 1;
  const pinHeight = isHighlighted ? 48 : 36;
  const pinWidth = isHighlighted ? 36 : 28;

  // Star SVG for highlighted state
  const starIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="10" height="10" style="margin-top: 1px;">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>`;

  return L.divIcon({
    className: 'custom-pin-marker',
    html: `
      <div style="
        position: relative;
        transform: scale(${scale});
        transition: transform 0.2s ease;
        cursor: pointer;
        filter: ${isHighlighted ? 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))' : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'};
      ">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 28 ${isHighlighted ? 42 : 36}" width="${pinWidth}" height="${pinHeight}">
          <g clip-path="url(#pin-clip)">
            <path fill="#0D1619" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 1c3.503 0 6.535.952 9.293 3.707C26.11 7.521 27 10.702 27 14.291c0 4.781-2.69 9.832-6.79 15.095-1.723 2.213-3.356 3.849-4.944 5.156l-.004.003a1.975 1.975 0 0 1-2.524 0l-.004-.003c-1.588-1.307-3.22-2.943-4.945-5.156C3.69 24.123 1 19.072 1 14.29c0-3.589.89-6.77 3.707-9.584C7.464 1.953 10.497 1 14 1"/>
          </g>
          <defs>
            <clipPath id="pin-clip">
              <path fill="#fff" d="M0 0h28v${isHighlighted ? 42 : 36}H0z"/>
            </clipPath>
          </defs>
        </svg>
        <div style="
          position: absolute;
          top: ${isHighlighted ? '4px' : '6px'};
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-size: ${isHighlighted ? '12px' : '11px'};
          font-weight: 600;
          font-family: system-ui, -apple-system, sans-serif;
          white-space: nowrap;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0px;
        ">
          ${rating.toFixed(1)}
          ${isHighlighted ? starIcon : ''}
        </div>
      </div>
    `,
    iconSize: [pinWidth, pinHeight],
    iconAnchor: [pinWidth / 2, pinHeight],
  });
}

// Component to handle map bounds and interactions
function MapController({
  vendors,
  hoveredVendorId,
}: {
  vendors: VendorMapData[];
  hoveredVendorId: string | null;
}) {
  const map = useMap();

  // Filter vendors with valid coordinates
  const mappableVendors = useMemo(() =>
    vendors.filter(v => v.latitude && v.longitude && v.latitude !== 0 && v.longitude !== 0),
    [vendors]
  );

  // Fit bounds when vendors change
  useEffect(() => {
    if (mappableVendors.length > 0) {
      const bounds = L.latLngBounds(
        mappableVendors.map(v => [v.latitude!, v.longitude!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, mappableVendors]);

  // Pan to hovered vendor
  useEffect(() => {
    if (hoveredVendorId) {
      const vendor = mappableVendors.find(v => v.id === hoveredVendorId);
      if (vendor?.latitude && vendor?.longitude) {
        map.panTo([vendor.latitude, vendor.longitude], { animate: true });
      }
    }
  }, [map, hoveredVendorId, mappableVendors]);

  return null;
}

export default function LeafletMap({ vendors, hoveredVendorId, onMarkerHover, onMarkerClick }: LeafletMapProps) {
  // Filter vendors with valid coordinates
  const mappableVendors = useMemo(() =>
    vendors.filter(v => v.latitude && v.longitude && v.latitude !== 0 && v.longitude !== 0),
    [vendors]
  );

  // Calculate initial center
  const initialCenter = useMemo((): [number, number] => {
    if (mappableVendors.length === 0) return DEFAULT_CENTER;

    const avgLat = mappableVendors.reduce((sum, v) => sum + v.latitude!, 0) / mappableVendors.length;
    const avgLng = mappableVendors.reduce((sum, v) => sum + v.longitude!, 0) / mappableVendors.length;
    return [avgLat, avgLng];
  }, [mappableVendors]);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={initialCenter}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        {/* CartoDB Voyager tiles - English labels, clean design */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Map controller for bounds and interactions */}
        <MapController vendors={vendors} hoveredVendorId={hoveredVendorId} />

        {/* Vendor markers */}
        {mappableVendors.map((vendor) => (
          <Marker
            key={vendor.id}
            position={[vendor.latitude!, vendor.longitude!]}
            icon={createPinIcon(vendor.rating, hoveredVendorId === vendor.id)}
            eventHandlers={{
              click: () => onMarkerClick(vendor.id),
              mouseover: () => onMarkerHover(vendor.id),
              mouseout: () => onMarkerHover(null),
            }}
          >
            <Popup>
              <div className="text-sm font-medium">{vendor.name}</div>
              <div className="text-sm text-gray-600">Rating: {vendor.rating.toFixed(1)}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Empty state overlay */}
      {mappableVendors.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-1000">
          <p className="text-gray-500 text-sm">No vendors with location data available</p>
        </div>
      )}

      {/* Custom styles for markers */}
      <style jsx global>{`
        .custom-pin-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        .leaflet-popup-content {
          margin: 8px 12px;
        }
      `}</style>
    </div>
  );
}
