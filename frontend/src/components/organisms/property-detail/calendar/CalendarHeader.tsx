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
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Bulan Sebelumnya"
        className="p-1 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Bulan Berikutnya"
        className="p-1 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-all active:scale-95"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function RoomSelector({ rooms, selectedId, onChange }: { rooms: RoomOption[]; selectedId?: string; onChange?: (id: string) => void }) {
  if (rooms.length <= 1) return null;
  return (
    <div className="flex items-center gap-1.5">
      <BedDouble className="w-3.5 h-3.5 text-primary-600 shrink-0" />
      <select
        value={selectedId || rooms[0]?.id}
        onChange={(e) => onChange?.(e.target.value)}
        aria-label="Pilih Tipe Kamar untuk Kalender"
        className="text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CalendarHeader({
  month,
  year,
  onNext,
  onPrev,
  canPrev,
  rooms = [],
  selectedRoomId,
  onRoomChange,
}: CalendarHeaderProps): React.JSX.Element {
  const monthTitle = formatDateID(new Date(year, month - 1, 1), 'MMMM yyyy');
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-1.5 mb-0.5 border-b border-gray-100">
      <div className="flex items-center justify-between sm:justify-start gap-2.5">
        <h3 className="text-sm font-extrabold text-gray-900 capitalize tracking-tight">
          {monthTitle}
        </h3>
        <MonthNavButtons onPrev={onPrev} onNext={onNext} canPrev={canPrev} />
      </div>
      <RoomSelector rooms={rooms} selectedId={selectedRoomId} onChange={onRoomChange} />
    </div>
  );
}
