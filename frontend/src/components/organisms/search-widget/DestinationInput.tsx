import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, Loader2 } from 'lucide-react';
import { propertyApi } from '../../../modules/property/services/property.api';
import { GeocodeSuggestion } from '../../../modules/property/property.types';

export interface DestinationInputProps {
  value: string;
  onChange: (city: string) => void;
}

type SuggestionItemProps = { sug: GeocodeSuggestion; onSelect: (s: GeocodeSuggestion) => void };

function SuggestionItem({ sug, onSelect }: SuggestionItemProps) {
  const title = sug.city || sug.formattedAddress;
  return (
    <li>
      <button type="button" onClick={() => onSelect(sug)} className="w-full text-left px-3.5 py-2.5 hover:bg-primary-50 text-xs sm:text-sm text-gray-800 flex items-start gap-2 transition-colors border-b border-gray-100 last:border-b-0">
        <MapPin className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{title}</span>
          <span className="text-xs text-gray-500 line-clamp-1">{sug.formattedAddress}</span>
        </div>
      </button>
    </li>
  );
}

type DropdownProps = { list: GeocodeSuggestion[]; onSelect: (item: GeocodeSuggestion) => void };

function SuggestionsDropdown({ list, onSelect }: DropdownProps) {
  if (list.length === 0) return null;
  return (
    <ul className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
      {list.map((sug, i) => (
        <SuggestionItem key={i} sug={sug} onSelect={onSelect} />
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

async function fetchGeocode(query: string, setList: (s: GeocodeSuggestion[]) => void, setLoading: (b: boolean) => void) {
  setLoading(true);
  try {
    const res = await propertyApi.searchGeocode(query, 5);
    setList(res.data || []);
  } catch {
    setList([]);
  } finally {
    setLoading(false);
  }
}

function useDestinationSearch(value: string) {
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => fetchGeocode(value, setSuggestions, setIsLoading), 300);
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

function useDestinationInputState(onChange: (city: string) => void) {
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useDropdownDismiss(containerRef, showDropdown, () => setShowDropdown(false));
  const onSelect = (s: GeocodeSuggestion) => {
    onChange(s.city || s.formattedAddress.split(',')[0].trim());
    setShowDropdown(false);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') setShowDropdown(false);
  };
  return { showDropdown, setShowDropdown, containerRef, onSelect, onKeyDown };
}

export function DestinationInput({ value, onChange }: DestinationInputProps): React.JSX.Element {
  const { suggestions, isLoading } = useDestinationSearch(value);
  const s = useDestinationInputState(onChange);
  const onValChange = (v: string) => { onChange(v); s.setShowDropdown(true); };
  return (
    <div ref={s.containerRef} className="relative flex flex-col w-full">
      <DestinationHeader />
      <SearchInputField value={value} onChange={onValChange} isLoading={isLoading} onFocus={() => s.setShowDropdown(true)} onKeyDown={s.onKeyDown} />
      {s.showDropdown && <SuggestionsDropdown list={suggestions} onSelect={s.onSelect} />}
    </div>
  );
}
