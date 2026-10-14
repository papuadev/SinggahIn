import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, Loader2 } from 'lucide-react';
import { propertyApi } from '../../../modules/property/services/property.api';
import { GeocodeSuggestion, CatalogPropertyItem } from '../../../modules/property/property.types';
import { SuggestionsDropdown, cleanDisplayCity } from './SuggestionsDropdown';

export interface DestinationInputProps {
  value: string;
  onChange: (city: string) => void;
  onSelectProperty?: (property: CatalogPropertyItem) => void;
}

function useDropdownDismiss(ref: React.RefObject<HTMLElement | null>, isOpen: boolean, onDismiss: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onDismiss(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [ref, isOpen, onDismiss]);
}

async function fetchSuggestions(
  query: string, setCities: (s: GeocodeSuggestion[]) => void,
  setProps: (p: CatalogPropertyItem[]) => void, setLoading: (b: boolean) => void
) {
  setLoading(true);
  try {
    const cityP = Promise.resolve().then(() => propertyApi.searchGeocode(query, 5)).catch(() => ({ data: [] }));
    const propP = Promise.resolve().then(() => propertyApi.getCatalog?.({ name: query, limit: 4 })).catch(() => ({ data: [] }));
    const [cityRes, propRes] = await Promise.all([cityP, propP]);
    setCities(Array.isArray(cityRes?.data) ? cityRes.data : []);
    setProps(Array.isArray(propRes?.data) ? propRes.data : []);
  } catch {
    setCities([]); setProps([]);
  } finally {
    setLoading(false);
  }
}

function useDestinationSearch(value: string) {
  const [cities, setCities] = useState<GeocodeSuggestion[]>([]);
  const [properties, setProperties] = useState<CatalogPropertyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (!value || value.length < 2) {
      setCities([]); setProperties([]);
      return;
    }
    const timer = setTimeout(() => fetchSuggestions(value, setCities, setProperties, setIsLoading), 300);
    return () => clearTimeout(timer);
  }, [value]);
  return { cities, properties, isLoading };
}

function SearchInputIcon({ isLoading, value, onClear }: { isLoading: boolean; value: string; onClear: () => void }) {
  if (isLoading) return <Loader2 className="w-4 h-4 text-primary-600 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />;
  if (value) {
    return (
      <button type="button" onClick={onClear} aria-label="Hapus destinasi" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
    );
  }
  return null;
}

function SearchInputField({
  value, onChange, isLoading, onFocus, onKeyDown,
}: {
  value: string; onChange: (v: string) => void; isLoading: boolean; onFocus: () => void; onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="relative">
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)} onFocus={onFocus} onKeyDown={onKeyDown}
        placeholder="Mau menginap di mana? (mis. Bandung)" aria-label="Pencarian kota atau destinasi"
        className="w-full h-11 border border-gray-200 rounded-xl pl-3.5 pr-8 text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
      />
      <SearchInputIcon isLoading={isLoading} value={value} onClear={() => onChange('')} />
    </div>
  );
}

function useDestinationInputState(onChange: (city: string) => void, onSelectProp?: (p: CatalogPropertyItem) => void) {
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useDropdownDismiss(containerRef, showDropdown, () => setShowDropdown(false));
  const onSelectCity = (s: GeocodeSuggestion) => {
    onChange(cleanDisplayCity(s.city, s.formattedAddress));
    setShowDropdown(false);
  };
  const onSelectProperty = (p: CatalogPropertyItem) => {
    if (onSelectProp) onSelectProp(p);
    else onChange(p.title);
    setShowDropdown(false);
  };
  return { showDropdown, setShowDropdown, containerRef, onSelectCity, onSelectProperty };
}

export function DestinationInput(p: DestinationInputProps): React.JSX.Element {
  const { cities, properties, isLoading } = useDestinationSearch(p.value);
  const s = useDestinationInputState(p.onChange, p.onSelectProperty);
  const onValChange = (v: string) => { p.onChange(v); s.setShowDropdown(true); };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Escape') s.setShowDropdown(false); };
  return (
    <div ref={s.containerRef} className="relative flex flex-col w-full">
      <span className="h-5 mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
        <MapPin className="w-3.5 h-3.5 text-primary-600" /> Kota atau Destinasi
      </span>
      <SearchInputField value={p.value} onChange={onValChange} isLoading={isLoading} onFocus={() => s.setShowDropdown(true)} onKeyDown={onKeyDown} />
      {s.showDropdown && (
        <SuggestionsDropdown cities={cities} properties={properties} onSelectCity={s.onSelectCity} onSelectProp={s.onSelectProperty} />
      )}
    </div>
  );
}
