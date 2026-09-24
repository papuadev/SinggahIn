import React from 'react';
import { ChevronLeft, ChevronRight, BedDouble } from 'lucide-react';
import { formatDateID } from '../../../../libs/formatters';

interface RoomOption {
  id: string;
  name: string;
  basePrice: number;
}

interface CalendarHeaderProps {
  month: number;
  year: number;
  onNext: () => void;
  onPrev: () => void;
  canPrev: boolean;
  rooms?: RoomOption[];
  selectedRoomId?: string;
  onRoomChange?: (id: string) => void;
}

function MonthNavButtons({ onPrev, onNext, canPrev }: { onPrev: () => void; onNext: () => void; canPrev: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={onPrev} disabled={!canPrev} aria-label="Bulan Sebelumnya"
        className="p-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button type="button" onClick={onNext} aria-label="Bulan Berikutnya"
        className="p-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function RoomSelector({ rooms, selectedId, onChange }: { rooms: RoomOption[]; selectedId?: string; onChange?: (id: string) => void }) {
  if (rooms.length <= 1) return null;
  return (
    <div className="flex items-center gap-2">
      <BedDouble className="w-4 h-4 text-primary-600 shrink-0" />
      <select
        value={selectedId || rooms[0]?.id} onChange={(e) => onChange?.(e.target.value)}
        aria-label="Pilih Tipe Kamar untuk Kalender"
        className="text-xs sm:text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
      </select>
    </div>
  );
}

export function CalendarHeader({
  month, year, onNext, onPrev, canPrev, rooms = [], selectedRoomId, onRoomChange,
}: CalendarHeaderProps): React.JSX.Element {
  const monthTitle = formatDateID(new Date(year, month - 1, 1), 'MMMM yyyy');
  return (
    <div className="flex flex-col gap-2.5 pb-3 border-b border-gray-100">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 capitalize">{monthTitle}</h3>
        <MonthNavButtons onPrev={onPrev} onNext={onNext} canPrev={canPrev} />
      </div>
      <RoomSelector rooms={rooms} selectedId={selectedRoomId} onChange={onRoomChange} />
    </div>
  );
}
