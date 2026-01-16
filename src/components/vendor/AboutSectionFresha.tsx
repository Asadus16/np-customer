'use client';

import { MapPin, Clock, Phone, Globe, ChevronRight, Info } from 'lucide-react';

interface OpeningHour {
  day: string;
  open: string;
  close: string;
  isClosed?: boolean;
}

interface AboutSectionFreshaProps {
  description: string;
  location: string;
  phone?: string;
  website?: string;
  openingHours?: OpeningHour[];
  additionalInfo?: string[];
}

export function AboutSectionFresha({
  description,
  location,
  phone,
  website,
  openingHours,
  additionalInfo = [],
}: AboutSectionFreshaProps) {
  const defaultHours: OpeningHour[] = [
    { day: 'Monday', open: '09:00', close: '20:00' },
    { day: 'Tuesday', open: '09:00', close: '20:00' },
    { day: 'Wednesday', open: '09:00', close: '20:00' },
    { day: 'Thursday', open: '09:00', close: '20:00' },
    { day: 'Friday', open: '09:00', close: '20:00' },
    { day: 'Saturday', open: '10:00', close: '18:00' },
    { day: 'Sunday', open: '10:00', close: '18:00', isClosed: true },
  ];

  const hours = openingHours || defaultHours;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const defaultInfo = [
    'Free Wi-Fi available',
    'Wheelchair accessible',
    'Air conditioned',
    'Parking available',
    'Card payments accepted',
  ];

  const infoItems = additionalInfo.length > 0 ? additionalInfo : defaultInfo;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column */}
      <div className="space-y-8">
        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>

        {/* Map */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Location</h3>
          </div>

          {/* Map placeholder */}
          <div className="aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden relative mb-3">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Map view</p>
              </div>
            </div>
          </div>

          <p className="text-gray-700">{location}</p>
          <button className="text-sm text-gray-500 hover:text-gray-700 mt-1 flex items-center gap-1">
            Get directions
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* Contact */}
        {(phone || website) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact</h3>
            <div className="space-y-3">
              {phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <a href={`tel:${phone}`} className="text-gray-700 hover:text-gray-900">
                    {phone}
                  </a>
                </div>
              )}
              {website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-gray-400" />
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-gray-900"
                  >
                    {website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Column */}
      <div className="space-y-8">
        {/* Opening Times */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Opening times</h3>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <table className="w-full">
              <tbody>
                {hours.map((hour) => (
                  <tr
                    key={hour.day}
                    className={`${hour.day === today ? 'font-medium' : ''}`}
                  >
                    <td className="py-2 text-gray-700">
                      {hour.day}
                      {hour.day === today && (
                        <span className="ml-2 text-xs text-gray-400">(Today)</span>
                      )}
                    </td>
                    <td className="py-2 text-right text-gray-700">
                      {hour.isClosed ? (
                        <span className="text-gray-400">Closed</span>
                      ) : (
                        `${hour.open} - ${hour.close}`
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Additional information</h3>
          </div>

          <ul className="space-y-2">
            {infoItems.map((item, index) => (
              <li key={index} className="flex items-center gap-2 text-gray-700">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
