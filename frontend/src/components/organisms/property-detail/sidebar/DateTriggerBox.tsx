import { Calendar, ChevronDown } from 'lucide-react';
import { formatDateID } from '../../../../libs/formatters';

function formatTriggerDate(dateStr?: string) {
  if (!dateStr) return 'Pilih tanggal';
  try {
    return formatDateID(dateStr, 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

function DateTriggerHeader({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
      <span className="flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-primary-600" /> TANGGAL MENGINAP
      </span>
      <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </div>
  );
}

function DateTriggerDates({ checkIn, checkOut }: { checkIn?: string; checkOut?: string }) {
  return (
    <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-gray-900">
      <span>{formatTriggerDate(checkIn)}</span>
      <span className="text-gray-300 font-normal">→</span>
      <span>{formatTriggerDate(checkOut)}</span>
    </div>
  );
}

export interface DateTriggerProps {
  checkIn?: string;
  checkOut?: string;
  onClick: () => void;
  isOpen: boolean;
}

export function DateTriggerBox({ checkIn, checkOut, onClick, isOpen }: DateTriggerProps) {
  const borderCls = isOpen ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-200 hover:border-gray-300';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Buka Kalender Pemilihan Tanggal"
      className={`w-full p-3 rounded-xl border bg-gray-50/70 text-left transition-all ${borderCls}`}
    >
      <DateTriggerHeader isOpen={isOpen} />
      <DateTriggerDates checkIn={checkIn} checkOut={checkOut} />
    </button>
  );
}
