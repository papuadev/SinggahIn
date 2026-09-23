import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DestinationInput } from './search-widget/DestinationInput';
import { DateRangeSelector } from './search-widget/DateRangeSelector';
import { GuestCounter } from './search-widget/GuestCounter';
import { CategoryFilterChips } from './search-widget/CategoryFilterChips';

export interface SearchWidgetValues {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  category: string;
}

interface FloatingSearchWidgetProps {
  initialValues?: Partial<SearchWidgetValues>;
  onSearch?: (values: SearchWidgetValues) => void;
  className?: string;
}

function buildSearchUrl(values: SearchWidgetValues): string {
  const params = new URLSearchParams();
  if (values.city) params.set('city', values.city);
  if (values.checkIn) params.set('checkIn', values.checkIn);
  if (values.checkOut) params.set('checkOut', values.checkOut);
  if (values.guests > 1) params.set('guests', String(values.guests));
  if (values.category) params.set('category', values.category);
  const q = params.toString();
  return q ? `/search?${q}` : '/search';
}

function SearchSubmitButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex flex-col w-full">
      <span
        className="hidden md:flex h-5 mb-1.5 items-center text-xs invisible select-none"
        aria-hidden="true"
      >
        &nbsp;
      </span>
      <button
        type="button"
        onClick={onClick}
        aria-label="Cari penginapan"
        className="w-full h-11 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
      >
        <Search className="w-4 h-4" />
        <span>Cari Penginapan</span>
      </button>
    </div>
  );
}

function SearchInputsGrid({
  city,
  setCity,
  checkIn,
  checkOut,
  onDateChange,
  guests,
  setGuests,
  onSearch,
}: {
  city: string;
  setCity: (c: string) => void;
  checkIn: string;
  checkOut: string;
  onDateChange: (i: string, o: string) => void;
  guests: number;
  setGuests: (g: number) => void;
  onSearch: () => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 md:gap-4 items-end">
      <div className="md:col-span-4 w-full">
        <DestinationInput value={city} onChange={setCity} />
      </div>
      <div className="md:col-span-4 w-full">
        <DateRangeSelector
          checkIn={checkIn}
          checkOut={checkOut}
          onChange={onDateChange}
        />
      </div>
      <div className="md:col-span-2 w-full">
        <GuestCounter value={guests} onChange={setGuests} />
      </div>
      <div className="md:col-span-2 w-full mt-1 md:mt-0">
        <SearchSubmitButton onClick={onSearch} />
      </div>
    </div>
  );
}

export function FloatingSearchWidget({
  initialValues,
  onSearch,
  className = '',
}: FloatingSearchWidgetProps): React.JSX.Element {
  const [city, setCity] = useState(initialValues?.city || '');
  const [checkIn, setCheckIn] = useState(initialValues?.checkIn || '');
  const [checkOut, setCheckOut] = useState(initialValues?.checkOut || '');
  const [guests, setGuests] = useState(initialValues?.guests || 1);
  const [category, setCategory] = useState(initialValues?.category || '');
  const navigate = useNavigate();

  const handleSearch = () => {
    const payload = { city, checkIn, checkOut, guests, category };
    return onSearch ? onSearch(payload) : navigate(buildSearchUrl(payload));
  };

  return (
    <div
      aria-label="Widget pencarian properti"
      className={`bg-white border border-gray-100 rounded-2xl md:rounded-3xl shadow-xl p-4 sm:p-5 md:p-6 w-full ${className}`}
    >
      <div className="mb-3.5 md:mb-4">
        <CategoryFilterChips selected={category} onSelect={setCategory} />
      </div>
      <SearchInputsGrid
        city={city}
        setCity={setCity}
        checkIn={checkIn}
        checkOut={checkOut}
        onDateChange={(i, o) => {
          setCheckIn(i);
          setCheckOut(o);
        }}
        guests={guests}
        setGuests={setGuests}
        onSearch={handleSearch}
      />
    </div>
  );
}
