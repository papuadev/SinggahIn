import { useRef, useEffect } from 'react';
import { Calendar, ChevronDown, X, Check } from 'lucide-react';
import { formatDateID } from '../../../../libs/formatters';
import { InteractivePriceCalendar } from '../InteractivePriceCalendar';
import { Button } from '../../../atoms/Button';

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

function PopoverHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-gray-100">
      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
        <Calendar className="w-4 h-4 text-primary-600 shrink-0" />
        Pilih Tanggal Menginap
      </h3>
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup Kalender"
        className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function ModalFooter({
  hasDates,
  onReset,
  onClose,
}: {
  hasDates: boolean;
  onReset: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-gray-100">
      <button
        type="button"
        onClick={onReset}
        className="text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors"
      >
        Reset Pilihan
      </button>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          className="h-7 px-2.5 text-xs"
        >
          Tutup
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onClose}
          disabled={!hasDates}
          leftIcon={<Check className="w-3 h-3" />}
          className="h-7 px-2.5 text-xs font-bold"
        >
          Terapkan Tanggal
        </Button>
      </div>
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

export function CalendarPopover({
  isOpen,
  onClose,
  propertyId,
  rooms = [],
  activeRoomId,
  onRoom,
  inDate,
  outDate,
  onDates,
}: PopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (target.closest('[aria-label="Buka Kalender Pemilihan Tanggal"]')) {
          return;
        }
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const onSelect = (cin: string, cout: string) => {
    onDates?.(cin, cout);
    if (cin && cout) {
      onClose();
    }
  };

  const handleReset = () => {
    onDates?.('', '');
  };

  const hasDates = Boolean(inDate && outDate);

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Pilih Tanggal Menginap"
      className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl border border-gray-200 shadow-xl p-3 sm:p-3.5 focus:outline-none animate-in fade-in slide-in-from-top-2"
    >
      <PopoverHeader onClose={onClose} />
      <InteractivePriceCalendar
        propertyId={propertyId}
        rooms={rooms}
        selectedRoomId={activeRoomId}
        onRoomChange={onRoom}
        checkIn={inDate}
        checkOut={outDate}
        onSelectDates={onSelect}
        variant="sidebar"
      />
      <ModalFooter hasDates={hasDates} onReset={handleReset} onClose={onClose} />
    </div>
  );
}

export const CalendarModal = CalendarPopover;
