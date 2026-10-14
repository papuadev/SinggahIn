import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { PropertyMapPin } from '../../../modules/property/components/PropertyMapPin';

export interface PropertyDetailMapProps {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
}

function OpenInMapsButton({ lat, lng }: { lat: number; lng: number }) {
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-200 transition-colors">
      <span>Buka di Google Maps</span>
      <ExternalLink className="w-3.5 h-3.5" />
    </a>
  );
}

function MapHeader({ lat, lng, address, city }: { lat: number; lng: number; address: string; city: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <div>
        <h2 id="lokasi-properti" className="text-lg sm:text-xl font-bold text-gray-900">Lokasi & Area Sekitar</h2>
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 mt-1">
          <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0" />
          <span>{address}, {city}</span>
        </div>
      </div>
      <OpenInMapsButton lat={lat} lng={lng} />
    </div>
  );
}

export function PropertyDetailMap({ latitude, longitude, address, city }: PropertyDetailMapProps): React.JSX.Element {
  return (
    <section aria-labelledby="lokasi-properti" className="py-6 border-b border-gray-100">
      <MapHeader lat={latitude} lng={longitude} address={address} city={city} />
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
        <PropertyMapPin latitude={latitude} longitude={longitude} readonly={true} height="340px" />
      </div>
    </section>
  );
}
