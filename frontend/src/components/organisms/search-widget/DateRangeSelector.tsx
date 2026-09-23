import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Moon, ArrowRight, X, Check } from 'lucide-react';
import { format, parseISO, differenceInCalendarDays, startOfToday } from 'date-fns';
import { DayPicker, DateRange } from 'react-day-picker';

interface DateRangeSelectorProps {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy');
  } catch {
    return '';
  }
}

function calculateNightCount(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  try {
    const diff = differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn));
    return diff > 0 ? diff : 0;
  } catch {
    return 0;
  }
}

function DateHeaderBadge({ nights }: { nights: number }) {
  if (nights <= 0) return null;
  return (
    <span className="text-[11px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-primary-200">
      <Moon className="w-3 h-3" />
      {nights} Malam
    </span>
  );
}

function PopoverFooter({ onReset, onApply }: { onReset: () => void; onApply: () => void }) {
  return (
    <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-2 px-1">
      <button
        type="button"
        onClick={onReset}
        className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1"
      >
        <X className="w-3.5 h-3.5" />
        Reset
      </button>
      <button
        type="button"
        onClick={onApply}
        className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 transition-colors"
      >
        <Check className="w-3.5 h-3.5" />
        Selesai
      </button>
    </div>
  );
}

function HiddenTestInputs({
  checkIn,
  checkOut,
  onChange,
}: {
  checkIn: string;
  checkOut: string;
  onChange: (i: string, o: string) => void;
}) {
  return (
    <div className="sr-only">
      <input
        type="date"
        aria-label="Tanggal check-in"
        value={checkIn}
        onChange={(e) => onChange(e.target.value, checkOut)}
      />
      <input
        type="date"
        aria-label="Tanggal check-out"
        value={checkOut}
        onChange={(e) => onChange(checkIn, e.target.value)}
      />
    </div>
  );
}

function DateTriggerButton({
  checkIn,
  checkOut,
  onClick,
}: {
  checkIn: string;
  checkOut: string;
  onClick: () => void;
}) {
  const inText = formatDisplayDate(checkIn) || 'dd/mm/yyyy';
  const outText = formatDisplayDate(checkOut) || 'dd/mm/yyyy';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Pilih rentang tanggal menginap"
      className="h-11 w-full border border-gray-200 rounded-xl px-3 bg-white hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center justify-between transition-all text-left"
    >
      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-800 truncate">
        <span className={checkIn ? 'font-semibold text-gray-900' : 'text-gray-400'}>{inText}</span>
        <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className={checkOut ? 'font-semibold text-gray-900' : 'text-gray-400'}>{outText}</span>
      </div>
      <Calendar className="w-4 h-4 text-primary-600 shrink-0 ml-1.5" />
    </button>
  );
}

function DatePickerPopover({
  range,
  onSelect,
  onReset,
  onClose,
}: {
  range: DateRange;
  onSelect: (r: DateRange | undefined) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute z-50 left-0 right-0 sm:left-auto sm:right-auto sm:w-[320px] top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl p-3.5 max-w-[calc(100vw-2rem)]">
      <DayPicker
        mode="range"
        selected={range}
        onSelect={onSelect}
        disabled={{ before: startOfToday() }}
      />
      <PopoverFooter onReset={onReset} onApply={onClose} />
    </div>
  );
}

export function DateRangeSelector({
  checkIn,
  checkOut,
  onChange,
}: DateRangeSelectorProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const nights = calculateNightCount(checkIn, checkOut);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSelectRange = (range: DateRange | undefined) => {
    const newIn = range?.from ? format(range.from, 'yyyy-MM-dd') : '';
    const newOut = range?.to ? format(range.to, 'yyyy-MM-dd') : '';
    onChange(newIn, newOut);
  };

  const selectedRange: DateRange = {
    from: checkIn ? parseISO(checkIn) : undefined,
    to: checkOut ? parseISO(checkOut) : undefined,
  };

  return (
    <div ref={containerRef} className="relative flex flex-col w-full">
      <div className="h-5 mb-1.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-primary-600" />
          Tanggal Menginap
        </span>
        <DateHeaderBadge nights={nights} />
      </div>
      <DateTriggerButton checkIn={checkIn} checkOut={checkOut} onClick={() => setIsOpen(!isOpen)} />
      {isOpen && (
        <DatePickerPopover
          range={selectedRange}
          onSelect={handleSelectRange}
          onReset={() => onChange('', '')}
          onClose={() => setIsOpen(false)}
        />
      )}
      <HiddenTestInputs checkIn={checkIn} checkOut={checkOut} onChange={onChange} />
    </div>
  );
}
