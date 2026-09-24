import { Calendar, ChevronDown, X } from 'lucide-react';
import { formatDateID } from '../../../../libs/formatters';
import { InteractivePriceCalendar } from '../InteractivePriceCalendar';

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
  checkIn?: string; checkOut?: string; onClick: () => void; isOpen: boolean;
}

export function DateTriggerBox({ checkIn, checkOut, onClick, isOpen }: DateTriggerProps) {
  const borderCls = isOpen ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-200 hover:border-gray-300';
  return (
    <button
      type="button" onClick={onClick} aria-label="Buka Kalender Pemilihan Tanggal"
      className={`w-full p-3 rounded-xl border bg-gray-50/70 text-left transition-all ${borderCls}`}
    >
      <DateTriggerHeader isOpen={isOpen} />
      <DateTriggerDates checkIn={checkIn} checkOut={checkOut} />
    </button>
  );
}

function PopoverHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
      <span className="text-xs font-bold text-gray-800">Pilih Tanggal Menginap</span>
      <button type="button" onClick={onClose} aria-label="Tutup Kalender" className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  rooms?: Array<{ id: string; name: string; basePrice: number }>;
  activeRoomId?: string;
  onRoom?: (roomId: string) => void;
  inDate?: string;
  outDate?: string;
  onDates?: (checkIn: string, checkOut: string) => void;
}

export function CalendarPopover({ isOpen, onClose, propertyId, rooms = [], activeRoomId, onRoom, inDate, outDate, onDates }: PopoverProps) {
  if (!isOpen) return null;
  const onSelect = (cin: string, cout: string) => { onDates?.(cin, cout); if (cin && cout) onClose(); };
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} aria-hidden="true" />
      <div className="absolute z-40 top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 sm:p-4 animate-in fade-in zoom-in-95">
        <PopoverHeader onClose={onClose} />
        <InteractivePriceCalendar propertyId={propertyId} rooms={rooms} selectedRoomId={activeRoomId} onRoomChange={onRoom} checkIn={inDate} checkOut={outDate} onSelectDates={onSelect} variant="sidebar" />
      </div>
    </>
  );
}
