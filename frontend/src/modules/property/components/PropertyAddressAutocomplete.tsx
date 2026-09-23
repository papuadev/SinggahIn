import React, { useState, useEffect, useRef } from 'react';
import { UseFormRegister } from 'react-hook-form';
import { MapPin } from 'lucide-react';
import { FormField } from '../../../components/molecules/FormField';
import { Input } from '../../../components/atoms/Input';
import { Spinner } from '../../../components/atoms/Spinner';
import { propertyApi } from '../services/property.api';
import { GeocodeSuggestion } from '../property.types';
import { PropertyFormData } from '../schemas/property.schema';

interface AddressAutocompleteProps {
  register: UseFormRegister<PropertyFormData>;
  error?: string;
  onSelectSuggestion: (item: GeocodeSuggestion) => void;
}

interface SuggestionItemProps {
  item: GeocodeSuggestion;
  onSelect: (i: GeocodeSuggestion) => void;
}

function SuggestionItem({ item, onSelect }: SuggestionItemProps) {
  return (
    <li
      onClick={() => onSelect(item)} role="button" tabIndex={0}
      className="px-3.5 py-2.5 hover:bg-primary-50 cursor-pointer flex items-start gap-2.5 transition-colors text-left"
    >
      <MapPin className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-800 leading-tight">{item.formattedAddress}</span>
        {item.city && <span className="text-xs text-gray-500 mt-0.5">{item.city}</span>}
      </div>
    </li>
  );
}

function DropdownList({ items, onSelect }: { items: GeocodeSuggestion[]; onSelect: (i: GeocodeSuggestion) => void }) {
  if (items.length === 0) return <div className="p-3 text-xs text-gray-400">Tidak ada saran alamat ditemukan</div>;
  return (
    <ul className="divide-y divide-gray-100">
      {items.map((item, idx) => (
        <SuggestionItem key={`${item.latitude}-${item.longitude}-${idx}`} item={item} onSelect={onSelect} />
      ))}
    </ul>
  );
}

function AddressDropdown({
  open, loading, items, onSelect,
}: { open: boolean; loading: boolean; items: GeocodeSuggestion[]; onSelect: (i: GeocodeSuggestion) => void }) {
  if (!open) return null;
  return (
    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto" data-testid="address-suggestions-dropdown">
      {loading ? (
        <div className="p-3 text-xs text-gray-500 flex items-center gap-2">
          <Spinner size="sm" /> Mencari alamat...
        </div>
      ) : <DropdownList items={items} onSelect={onSelect} />}
    </div>
  );
}

type SugSetter = (s: GeocodeSuggestion[]) => void;
type BoolSetter = (v: boolean) => void;

async function fetchSuggestions(query: string, setSug: SugSetter, setOpen: BoolSetter, setLoad: BoolSetter) {
  setLoad(true);
  try {
    const res = await propertyApi.searchGeocode(query.trim());
    setSug(res?.data && res.data.length > 0 ? res.data : []);
    setOpen(true);
  } catch {
    setSug([]);
  } finally {
    setLoad(false);
  }
}

function useDebouncedGeocode(query: string) {
  const [items, setItems] = useState<GeocodeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 3) {
      setItems([]); setOpen(false); setLoading(false); return;
    }
    const timer = setTimeout(() => fetchSuggestions(query, setItems, setOpen, setLoading), 350);
    return () => clearTimeout(timer);
  }, [query]);

  return { items, setItems, loading, open, setOpen };
}

function useOutsideClick(ref: React.RefObject<HTMLDivElement | null>, onOutside: () => void) {
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [ref, onOutside]);
}

interface AddressInputProps {
  register: UseFormRegister<PropertyFormData>;
  error?: string;
  setQuery: (q: string) => void;
  setOpen: (o: boolean) => void;
  itemsCount: number;
  loading: boolean;
}

function AddressInputField({ register, error, setQuery, setOpen, itemsCount, loading }: AddressInputProps) {
  return (
    <FormField label="Alamat Lengkap" required error={error}>
      <Input
        placeholder="Contoh: Jl. Kolonel Masturi No. 88"
        hasError={Boolean(error)}
        {...register('address', { onChange: (e) => setQuery(e.target.value) })}
        onFocus={() => { if (itemsCount > 0) setOpen(true); }}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
        rightIcon={loading ? <Spinner size="sm" /> : undefined}
        autoComplete="off"
      />
    </FormField>
  );
}

function createSelectHandler(
  onSelect: (item: GeocodeSuggestion) => void,
  setOpen: (o: boolean) => void,
  setItems: (i: GeocodeSuggestion[]) => void,
  setQuery: (q: string) => void
) {
  return (item: GeocodeSuggestion) => {
    onSelect(item); setOpen(false); setItems([]); setQuery('');
  };
}

export function PropertyAddressAutocomplete({ register, error, onSelectSuggestion }: AddressAutocompleteProps): React.JSX.Element {
  const [query, setQuery] = useState('');
  const { items, setItems, loading, open, setOpen } = useDebouncedGeocode(query);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick(dropdownRef, () => setOpen(false));
  const onSelect = createSelectHandler(onSelectSuggestion, setOpen, setItems, setQuery);

  return (
    <div ref={dropdownRef} className="relative">
      <AddressInputField register={register} error={error} setQuery={setQuery} setOpen={setOpen} itemsCount={items.length} loading={loading} />
      <AddressDropdown open={open} loading={loading} items={items} onSelect={onSelect} />
    </div>
  );
}
