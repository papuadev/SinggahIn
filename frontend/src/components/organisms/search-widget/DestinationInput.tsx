import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, Loader2 } from 'lucide-react';
import { propertyApi } from '../../../modules/property/services/property.api';
import { GeocodeSuggestion } from '../../../modules/property/property.types';

export interface DestinationInputProps {
  value: string;
  onChange: (city: string) => void;
}

function SuggestionItem({
  sug,
  onSelect,
}: {
  sug: GeocodeSuggestion;
  onSelect: (s: GeocodeSuggestion) => void;
}) {
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

function SuggestionsDropdown({
  list,
  onSelect,
}: {
  list: GeocodeSuggestion[];
  onSelect: (item: GeocodeSuggestion) => void;
}) {
  if (list.length === 0) return null;
  return (
    <ul className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
      {list.map((sug, i) => (
        <SuggestionItem key={i} sug={sug} onSelect={onSelect} />
      ))}
    </ul>
  );
}

function useOutsideClick(ref: React.RefObject<HTMLElement>, onOutside: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onOutside]);
}

function useDestinationSearch(value: string) {
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await propertyApi.searchGeocode(value, 5);
        setSuggestions(res.data || []);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  return { suggestions, isLoading };
}

function ClearDestinationButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Hapus destinasi"
      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
    >
      <X className="w-4 h-4" />
    </button>
  );
}

function SearchInputField({
  value,
  onChange,
  isLoading,
  onFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  isLoading: boolean;
  onFocus: () => void;
}) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder="Mau menginap di mana? (mis. Bandung)"
        aria-label="Pencarian kota atau destinasi"
        className="w-full h-11 border border-gray-200 rounded-xl pl-3.5 pr-8 text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
      />
      {isLoading && (
        <Loader2 className="w-4 h-4 text-primary-600 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
      )}
      {!isLoading && value && <ClearDestinationButton onClick={() => onChange('')} />}
    </div>
  );
}

export function DestinationInput({
  value,
  onChange,
}: DestinationInputProps): React.JSX.Element {
  const { suggestions, isLoading } = useDestinationSearch(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useOutsideClick(containerRef, () => setShowDropdown(false));

  const handleSelect = (s: GeocodeSuggestion) => {
    onChange(s.city || s.formattedAddress.split(',')[0].trim());
    setShowDropdown(false);
  };

  const handleFocus = () => setShowDropdown(true);
  const handleChange = (v: string) => {
    onChange(v);
    setShowDropdown(true);
  };

  return (
    <div ref={containerRef} className="relative flex flex-col w-full">
      <span className="h-5 mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
        <MapPin className="w-3.5 h-3.5 text-primary-600" />
        Kota atau Destinasi
      </span>
      <SearchInputField value={value} onChange={handleChange} isLoading={isLoading} onFocus={handleFocus} />
      {showDropdown && suggestions.length > 0 && (
        <SuggestionsDropdown list={suggestions} onSelect={handleSelect} />
      )}
    </div>
  );
}
