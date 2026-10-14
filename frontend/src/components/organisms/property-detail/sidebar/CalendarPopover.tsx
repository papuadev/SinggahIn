import { useRef, useEffect } from 'react';
import { Calendar, X, Check } from 'lucide-react';
import { InteractivePriceCalendar } from '../InteractivePriceCalendar';
import { Button } from '../../../atoms/Button';
import { DateTriggerBox, DateTriggerProps } from './DateTriggerBox';

export { DateTriggerBox };
export type { DateTriggerProps };

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

function ModalFooterActions({ hasDates, onClose }: { hasDates: boolean; onClose: () => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-7 px-2.5 text-xs">
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
  );
}

function ModalFooter({ hasDates, onReset, onClose }: { hasDates: boolean; onReset: () => void; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-gray-100">
      <button type="button" onClick={onReset} className="text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors">
        Reset Pilihan
      </button>
      <ModalFooterActions hasDates={hasDates} onClose={onClose} />
    </div>
  );
}

function usePopoverDismiss(isOpen: boolean, onClose: () => void, ref: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    if (!isOpen) return;
    const handlePointer = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (!(e.target as HTMLElement).closest('[aria-label="Buka Kalender Pemilihan Tanggal"]')) onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose, ref]);
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

export function CalendarPopover(props: PopoverProps) {
  const { isOpen, onClose, propertyId, rooms = [], activeRoomId, onRoom, inDate, outDate, onDates } = props;
  const popoverRef = useRef<HTMLDivElement>(null);
  usePopoverDismiss(isOpen, onClose, popoverRef);
  if (!isOpen) return null;

  const onSelect = (cin: string, cout: string) => {
    onDates?.(cin, cout);
    if (cin && cout) onClose();
  };

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Pilih Tanggal Menginap"
      className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl border border-gray-200 shadow-xl p-3 sm:p-3.5 focus:outline-none animate-in fade-in slide-in-from-top-2"
    >
      <PopoverHeader onClose={onClose} />
      <InteractivePriceCalendar
        propertyId={propertyId} rooms={rooms} selectedRoomId={activeRoomId}
        onRoomChange={onRoom} checkIn={inDate} checkOut={outDate} onSelectDates={onSelect} variant="sidebar"
      />
      <ModalFooter hasDates={Boolean(inDate && outDate)} onReset={() => onDates?.('', '')} onClose={onClose} />
    </div>
  );
}

export const CalendarModal = CalendarPopover;
