'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface VendorMapClientProps {
  latitude: number;
  longitude: number;
  vendorName: string;
  address?: string;
}

// Create custom marker icon with the same pin SVG used in the search map
function createPinIcon() {
  const pinHeight = 46;
  const pinWidth = 36;

  return L.divIcon({
    className: 'custom-pin-marker',
    html: `
      <div style="
        position: relative;
        transform: scale(1.3);
        cursor: pointer;
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
      ">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 28 36" width="${pinWidth}" height="${pinHeight}">
          <g clip-path="url(#DS-illustration-map-pin-light__a)">
            <path fill="#0D1619" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 1c3.503 0 6.535.952 9.293 3.707C26.11 7.521 27 10.702 27 14.291c0 4.781-2.69 9.832-6.79 15.095-1.723 2.213-3.356 3.849-4.944 5.156l-.004.003a1.975 1.975 0 0 1-2.524 0l-.004-.003c-1.588-1.307-3.22-2.943-4.945-5.156C3.69 24.123 1 19.072 1 14.29c0-3.589.89-6.77 3.707-9.584C7.464 1.953 10.497 1 14 1"/>
          </g>
          <defs>
            <clipPath id="DS-illustration-map-pin-light__a">
              <path fill="#fff" d="M0 0h28v36H0z"/>
            </clipPath>
          </defs>
        </svg>
      </div>
    `,
    iconSize: [pinWidth, pinHeight],
    iconAnchor: [pinWidth / 2, pinHeight],
  });
}

// Component to set map view
function MapController({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], 15);
  }, [map, latitude, longitude]);

  return null;
}

export function VendorMapClient({ latitude, longitude, vendorName, address }: VendorMapClientProps) {
  const position: [number, number] = [latitude, longitude];

  return (
    <div className="w-full rounded-xl overflow-hidden h-[300px] md:h-[450px] lg:h-[500px] relative">
      <MapContainer
        center={position}
        zoom={15}
        className="w-full h-full"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        {/* CartoDB Voyager tiles - English labels, clean design */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Map controller */}
        <MapController latitude={latitude} longitude={longitude} />

        {/* Vendor marker */}
        <Marker position={position} icon={createPinIcon()}>
          <Popup>
            <div className="text-sm font-medium">{vendorName}</div>
            {address && <div className="text-sm text-gray-600">{address}</div>}
          </Popup>
        </Marker>
      </MapContainer>

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
