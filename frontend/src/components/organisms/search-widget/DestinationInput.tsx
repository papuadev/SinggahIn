import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, Loader2 } from 'lucide-react';
import { propertyApi } from '../../../modules/property/services/property.api';
import { GeocodeSuggestion } from '../../../modules/property/property.types';

export const POPULAR_DESTINATIONS = ['Bandung', 'Bali', 'Jakarta', 'Yogyakarta'];

interface DestinationInputProps {
  value: string;
  onChange: (city: string) => void;
}

function SuggestionItem({ sug, onSelect }: { sug: GeocodeSuggestion; onSelect: (s: GeocodeSuggestion) => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(sug)}
        className="w-full text-left px-3.5 py-2.5 hover:bg-primary-50 text-xs sm:text-sm text-gray-800 flex items-start gap-2 transition-colors border-b border-gray-100 last:border-b-0"
      >
        <MapPin className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{sug.city || sug.formattedAddress}</span>
          <span className="text-xs text-gray-500 line-clamp-1">{sug.formattedAddress}</span>
        </div>
      </button>
    </li>
  );
}

function SuggestionsDropdown({ list, onSelect }: { list: GeocodeSuggestion[]; onSelect: (item: GeocodeSuggestion) => void }) {
  if (list.length === 0) return null;
  return (
    <ul className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
      {list.map((sug, i) => (<SuggestionItem key={i} sug={sug} onSelect={onSelect} />))}
    </ul>
  );
}

function PopularChips({ onSelect }: { onSelect: (city: string) => void }) {
  return (
    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
      <span className="text-[11px] text-gray-400 font-medium">Populer:</span>
      {POPULAR_DESTINATIONS.map((c) => (
        <button key={c} type="button" onClick={() => onSelect(c)} className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
          {c}
        </button>
      ))}
    </div>
  );
}

function useDestinationSearch(value: string) {
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (!value || value.length < 2) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await propertyApi.searchGeocode(value, 5);
        setSuggestions(res.data || []);
      } catch { setSuggestions([]); } finally { setIsLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);
  return { suggestions, isLoading, setSuggestions };
}

function SearchInputField({ value, onChange, isLoading, onFocus }: { value: string; onChange: (v: string) => void; isLoading: boolean; onFocus: () => void }) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder="Mau menginap di mana? (mis. Bandung)"
        aria-label="Pencarian kota atau destinasi"
        className="w-full border border-gray-200 rounded-xl pl-3.5 pr-8 py-2 text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
      {isLoading && <Loader2 className="w-4 h-4 text-primary-600 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />}
      {!isLoading && value && (
        <button type="button" onClick={() => onChange('')} aria-label="Hapus destinasi" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function DestinationInput({ value, onChange }: DestinationInputProps): React.JSX.Element {
  const { suggestions, isLoading } = useDestinationSearch(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSelect = (s: GeocodeSuggestion) => {
    onChange(s.city || s.formattedAddress.split(',')[0].trim());
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} className="relative flex flex-col">
      <span className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-primary-600" />
        Kota atau Destinasi
      </span>
      <SearchInputField value={value} onChange={(v) => { onChange(v); setShowDropdown(true); }} isLoading={isLoading} onFocus={() => setShowDropdown(true)} />
      {showDropdown && suggestions.length > 0 && <SuggestionsDropdown list={suggestions} onSelect={handleSelect} />}
      <PopularChips onSelect={onChange} />
    </div>
  );
}
