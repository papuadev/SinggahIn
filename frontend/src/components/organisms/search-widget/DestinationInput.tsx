import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Building, X, Loader2, LucideIcon } from 'lucide-react';
import { propertyApi } from '../../../modules/property/services/property.api';
import { GeocodeSuggestion, CatalogPropertyItem } from '../../../modules/property/property.types';

export interface DestinationInputProps {
  value: string;
  onChange: (city: string) => void;
  onSelectProperty?: (property: CatalogPropertyItem) => void;
}

function SuggestionSectionHeader({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <li className="px-3.5 py-1 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 select-none" aria-hidden="true">
      <Icon className="w-3 h-3 text-primary-600" />
      <span>{title}</span>
    </li>
  );
}

function PropertySuggestionItem({ prop, onSelect }: { prop: CatalogPropertyItem; onSelect: (p: CatalogPropertyItem) => void }) {
  return (
    <li>
      <button type="button" onClick={() => onSelect(prop)} className="w-full text-left px-3.5 py-2 hover:bg-primary-50 text-xs sm:text-sm text-gray-800 flex items-center gap-2.5 transition-colors border-b border-gray-100 last:border-b-0">
        <Building className="w-4 h-4 text-primary-600 shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-gray-900 truncate">{prop.title}</span>
          <span className="text-xs text-gray-500 truncate">{prop.city} • <span className="capitalize">{prop.category.name}</span></span>
        </div>
      </button>
    </li>
  );
}

function cleanDisplayCity(city?: string, formatted?: string): string {
  const raw = (city || (formatted ? formatted.split(',')[0] : '')).trim();
  const cleaned = raw.replace(/^(daerah khusus ibukota|kota administrasi|kota|kabupaten|kab\.)\s+/i, '').trim();
  return cleaned || raw;
}

function CitySuggestionItem({ sug, onSelect }: { sug: GeocodeSuggestion; onSelect: (s: GeocodeSuggestion) => void }) {
  const title = cleanDisplayCity(sug.city, sug.formattedAddress);
  return (
    <li>
      <button type="button" onClick={() => onSelect(sug)} className="w-full text-left px-3.5 py-2 hover:bg-primary-50 text-xs sm:text-sm text-gray-800 flex items-start gap-2.5 transition-colors border-b border-gray-100 last:border-b-0">
        <MapPin className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-gray-900 truncate">{title}</span>
          <span className="text-xs text-gray-500 truncate line-clamp-1">{sug.formattedAddress}</span>
        </div>
      </button>
    </li>
  );
}

type DropdownProps = {
  cities: GeocodeSuggestion[]; properties: CatalogPropertyItem[];
  onSelectCity: (s: GeocodeSuggestion) => void; onSelectProp: (p: CatalogPropertyItem) => void;
};

function SuggestionsDropdown(p: DropdownProps) {
  if (p.cities.length === 0 && p.properties.length === 0) return null;
  return (
    <ul className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
      {p.properties.length > 0 && <SuggestionSectionHeader icon={Building} title="Penginapan & Destinasi" />}
      {p.properties.map((prop) => (
        <PropertySuggestionItem key={prop.id} prop={prop} onSelect={p.onSelectProp} />
      ))}
      {p.cities.length > 0 && <SuggestionSectionHeader icon={MapPin} title="Kota & Lokasi" />}
      {p.cities.map((sug, i) => (
        <CitySuggestionItem key={i} sug={sug} onSelect={p.onSelectCity} />
      ))}
    </ul>
  );
}

function useDropdownDismiss(ref: React.RefObject<HTMLElement>, isOpen: boolean, onDismiss: () => void) {
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
      setCities([]);
      setProperties([]);
      return;
    }
    const timer = setTimeout(() => fetchSuggestions(value, setCities, setProperties, setIsLoading), 300);
    return () => clearTimeout(timer);
  }, [value]);
  return { cities, properties, isLoading };
}

function ClearDestinationButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Hapus destinasi" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
      <X className="w-4 h-4" />
    </button>
  );
}

function SearchInputIcon({ isLoading, value, onClear }: { isLoading: boolean; value: string; onClear: () => void }) {
  if (isLoading) return <Loader2 className="w-4 h-4 text-primary-600 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />;
  if (value) return <ClearDestinationButton onClick={onClear} />;
  return null;
}

type SearchInputProps = {
  value: string; onChange: (v: string) => void; isLoading: boolean; onFocus: () => void; onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

function SearchInputField({ value, onChange, isLoading, onFocus, onKeyDown }: SearchInputProps) {
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

function DestinationHeader() {
  return (
    <span className="h-5 mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
      <MapPin className="w-3.5 h-3.5 text-primary-600" />
      Kota atau Destinasi
    </span>
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
      <DestinationHeader />
      <SearchInputField value={p.value} onChange={onValChange} isLoading={isLoading} onFocus={() => s.setShowDropdown(true)} onKeyDown={onKeyDown} />
      {s.showDropdown && (
        <SuggestionsDropdown cities={cities} properties={properties} onSelectCity={s.onSelectCity} onSelectProp={s.onSelectProperty} />
      )}
    </div>
  );
}
