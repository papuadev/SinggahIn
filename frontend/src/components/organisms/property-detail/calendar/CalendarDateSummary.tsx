import React from 'react';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { ArrowRight, RotateCcw, Moon } from 'lucide-react';
import { formatDateID } from '../../../../libs/formatters';

interface DateSummaryProps {
  checkIn?: string;
  checkOut?: string;
  onReset: () => void;
}

function calculateNights(cin?: string, cout?: string): number {
  if (!cin || !cout) return 0;
  try {
    const diff = differenceInCalendarDays(parseISO(cout), parseISO(cin));
    return diff > 0 ? diff : 0;
  } catch {
    return 0;
  }
}

function NightsBadge({ nights }: { nights: number }) {
  if (nights <= 0) return null;
  return (
    <span className="text-xs font-bold text-primary-700 bg-primary-100/70 px-2.5 py-0.5 rounded-full flex items-center gap-1">
      <Moon className="w-3 h-3" />
      {nights} Malam
    </span>
  );
}

function EmptySummaryHint() {
  return (
    <p className="text-xs text-gray-500 italic">
      Klik tanggal untuk memilih Check-in dan Check-out
    </p>
  );
}

function SummaryDetails({ checkIn, checkOut, nights }: { checkIn: string; checkOut?: string; nights: number }) {
  const outText = checkOut ? formatDateID(checkOut, 'dd MMM yyyy') : 'Pilih Check-out';
  const outCls = checkOut ? 'text-gray-900' : 'text-gray-400 font-normal italic';
  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-800">
      <span>{formatDateID(checkIn, 'dd MMM yyyy')}</span>
      <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
      <span className={outCls}>{outText}</span>
      <NightsBadge nights={nights} />
    </div>
  );
}

export function CalendarDateSummary({ checkIn, checkOut, onReset }: DateSummaryProps): React.JSX.Element {
  if (!checkIn) return <div className="py-2"><EmptySummaryHint /></div>;
  const nights = calculateNights(checkIn, checkOut);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-3.5 bg-gray-50 rounded-xl border border-gray-100 mb-2">
      <SummaryDetails checkIn={checkIn} checkOut={checkOut} nights={nights} />
      <button type="button" onClick={onReset} className="text-xs text-gray-500 hover:text-red-600 font-medium flex items-center gap-1 transition-colors">
        <RotateCcw className="w-3 h-3" /> Reset
      </button>
    </div>
  );
}
