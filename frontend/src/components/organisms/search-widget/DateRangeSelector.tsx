import React from 'react';
import { Calendar, Moon } from 'lucide-react';
import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';

interface DateRangeSelectorProps {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
}

function calculateNightCount(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const start = parseISO(checkIn);
  const end = parseISO(checkOut);
  const diff = differenceInCalendarDays(end, start);
  return diff > 0 ? diff : 0;
}

function resolveNextCheckOut(newIn: string, currOut: string): string {
  const inDate = parseISO(newIn);
  const defaultOut = format(addDays(inDate, 1), 'yyyy-MM-dd');
  if (!currOut) return defaultOut;
  const outDate = parseISO(currOut);
  return outDate <= inDate ? defaultOut : currOut;
}

export function DateRangeSelector({
  checkIn,
  checkOut,
  onChange,
}: DateRangeSelectorProps): React.JSX.Element {
  const today = format(new Date(), 'yyyy-MM-dd');
  const nights = calculateNightCount(checkIn, checkOut);

  const handleInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const nextOut = val ? resolveNextCheckOut(val, checkOut) : checkOut;
    onChange(val, nextOut);
  };

  const handleOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(checkIn, e.target.value);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-primary-600" />
          Tanggal Menginap
        </span>
        {nights > 0 && (
          <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Moon className="w-3 h-3" />
            {nights} Malam
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          min={today}
          value={checkIn}
          onChange={handleInChange}
          aria-label="Tanggal check-in"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <input
          type="date"
          min={checkIn || today}
          value={checkOut}
          onChange={handleOutChange}
          aria-label="Tanggal check-out"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
