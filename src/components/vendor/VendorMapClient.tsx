'use client';

interface VendorMapClientProps {
  latitude: number;
  longitude: number;
  vendorName: string;
  address?: string;
}

export function VendorMapClient({ latitude, longitude, vendorName, address }: VendorMapClientProps) {
  // Google Maps embed URL with marker
  const query = address ? encodeURIComponent(address) : `${latitude},${longitude}`;
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${query}&center=${latitude},${longitude}&zoom=15`;

  return (
    <div className="w-full rounded-xl overflow-hidden h-[300px] md:h-[450px] lg:h-[500px]">
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map showing location of ${vendorName}`}
      />
    </div>
  );
}
