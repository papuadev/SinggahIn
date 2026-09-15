import React, { useEffect, useRef, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin } from 'lucide-react';
import { Button } from '../../../components/atoms/Button';
import { Spinner } from '../../../components/atoms/Spinner';

function setupLeafletIcons(): void {
  delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

setupLeafletIcons();

interface MapClickHandlerProps {
  onSelect?: (lat: number, lng: number) => void;
  readonly?: boolean;
}

function MapClickHandler({ onSelect, readonly }: MapClickHandlerProps): null {
  useMapEvents({
    click(e) {
      if (!readonly && onSelect) {
        onSelect(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
      }
    },
  });
  return null;
}

function MapRecenter({ center }: { center: [number, number] }): null {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function onGeoSuccess(pos: GeolocationPosition, onSelect: (lat: number, lng: number) => void) {
  const lat = Number(pos.coords.latitude.toFixed(6));
  const lng = Number(pos.coords.longitude.toFixed(6));
  onSelect(lat, lng);
}

function requestCurrentLocation(
  onSelect: (lat: number, lng: number) => void,
  setLoading: (l: boolean) => void,
  setError: (e: string | null) => void
): void {
  if (!navigator.geolocation) return setError('Browser tidak mendukung geolokasi GPS.');
  setLoading(true);
  setError(null);
  navigator.geolocation.getCurrentPosition(
    (pos) => { setLoading(false); onGeoSuccess(pos, onSelect); },
    (err) => { setLoading(false); setError(`Gagal mengambil lokasi: ${err.message}`); }
  );
}

export interface PropertyMapPinProps {
  latitude: number;
  longitude: number;
  onChange?: (lat: number, lng: number) => void;
  readonly?: boolean;
  height?: string;
  className?: string;
}

const DEFAULT_CENTER: [number, number] = [-6.2088, 106.8456]; // Jakarta pusat default

export function PropertyMapPin({
  latitude,
  longitude,
  onChange,
  readonly = false,
  height = '320px',
  className = '',
}: PropertyMapPinProps): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const hasCoords = Boolean(latitude && longitude);
  const center: [number, number] = hasCoords ? [latitude, longitude] : DEFAULT_CENTER;

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker && onChange) {
          const pos = marker.getLatLng();
          onChange(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
        }
      },
    }),
    [onChange]
  );

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-primary-600" />
          {hasCoords ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` : 'Geser pin atau klik peta'}
        </span>
        {!readonly && onChange && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => requestCurrentLocation(onChange, setLoading, setGeoError)}
            disabled={loading}
            leftIcon={loading ? <Spinner size="sm" /> : <Navigation className="w-3.5 h-3.5" />}
          >
            Lokasi Saya
          </Button>
        )}
      </div>

      {geoError && <p className="text-xs text-red-600">{geoError}</p>}

      <div
        className="rounded-lg overflow-hidden border border-gray-300 shadow-sm relative z-0"
        style={{ height }}
      >
        <MapContainer
          center={center}
          zoom={hasCoords ? 14 : 11}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapRecenter center={center} />
          <MapClickHandler onSelect={onChange} readonly={readonly} />
          <Marker
            position={center}
            draggable={!readonly}
            eventHandlers={eventHandlers}
            ref={markerRef}
          />
        </MapContainer>
      </div>
      {!readonly && (
        <p className="text-xs text-gray-500 italic">
          * Klik pada peta atau seret penanda pin untuk menentukan lokasi yang tepat.
        </p>
      )}
    </div>
  );
}
