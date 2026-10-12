import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Building, X, Loader2, ChevronRight, LucideIcon } from 'lucide-react';
import { propertyApi } from '../../../modules/property/services/property.api';
import { GeocodeSuggestion, CatalogPropertyItem } from '../../../modules/property/property.types';

export interface DestinationInputProps {
  value: string;
  onChange: (city: string) => void;
  onSelectProperty?: (property: CatalogPropertyItem) => void;
}

function SuggestionSectionHeader({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <li className="px-3 pt-2.5 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 select-none" aria-hidden="true">
      <div className="p-1 rounded-md bg-gray-100 text-gray-500">
        <Icon className="w-3 h-3 text-primary-600" />
      </div>
      <span>{title}</span>
    </li>
  );
}

function PropertySuggestionItem({ prop, onSelect }: { prop: CatalogPropertyItem; onSelect: (p: CatalogPropertyItem) => void }) {
  const priceStr = prop.pricing?.averageNightRate ? `Rp ${prop.pricing.averageNightRate.toLocaleString('id-ID')}` : null;
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(prop)}
        className="w-full text-left p-2.5 rounded-xl hover:bg-primary-50/60 text-xs sm:text-sm text-gray-800 flex items-center justify-between gap-3 transition-all duration-150 group cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {prop.coverImage ? (
            <img
              src={prop.coverImage}
              alt={prop.title}
              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-100 shadow-2xs"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/70 text-primary-600 flex items-center justify-center shrink-0 border border-primary-200/40">
              <Building className="w-4 h-4" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
              {prop.title}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 truncate">
              <span className="text-[10px] font-semibold text-primary-700 bg-primary-50 px-1.5 py-0.2 rounded border border-primary-200/50 uppercase tracking-wide shrink-0">
                {prop.category.name}
              </span>
              <span className="truncate">{prop.city}</span>
              {priceStr && <span className="text-gray-400 shrink-0">• {priceStr} / malam</span>}
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all shrink-0" />
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
      <button
        type="button"
        onClick={() => onSelect(sug)}
        className="w-full text-left p-2.5 rounded-xl hover:bg-primary-50/60 text-xs sm:text-sm text-gray-800 flex items-center justify-between gap-3 transition-all duration-150 group cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-primary-50 text-gray-500 group-hover:text-primary-600 flex items-center justify-center shrink-0 transition-colors border border-gray-200/50 group-hover:border-primary-200/50">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
              {title}
            </span>
            <span className="text-xs text-gray-400 truncate line-clamp-1 mt-0.5">
              {sug.formattedAddress}
            </span>
          </div>
        </div>
        <span className="text-[11px] font-medium text-gray-400 group-hover:text-primary-600 shrink-0 hidden sm:inline-block">
          Pilih Kota
        </span>
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
    <ul className="absolute z-50 left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden max-h-80 overflow-y-auto p-1.5 space-y-1">
      {p.properties.length > 0 && (
        <div className="space-y-0.5">
          <SuggestionSectionHeader icon={Building} title="Penginapan & Destinasi" />
          {p.properties.map((prop) => (
            <PropertySuggestionItem key={prop.id} prop={prop} onSelect={p.onSelectProp} />
          ))}
        </div>
      )}
      {p.cities.length > 0 && (
        <div className="space-y-0.5 pt-1">
          <SuggestionSectionHeader icon={MapPin} title="Kota & Lokasi" />
          {p.cities.map((sug, i) => (
            <CitySuggestionItem key={i} sug={sug} onSelect={p.onSelectCity} />
          ))}
        </div>
      )}
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
