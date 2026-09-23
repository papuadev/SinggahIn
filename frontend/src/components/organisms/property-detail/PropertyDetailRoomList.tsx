import React from 'react';
import { BedDouble, Info } from 'lucide-react';
import { PropertyRoomSummary } from '../../../modules/property/property.types';
import { PropertyDetailRoomCard } from './PropertyDetailRoomCard';

export interface PropertyDetailRoomListProps {
  propertyId: string;
  rooms?: PropertyRoomSummary[];
  checkIn?: string;
  checkOut?: string;
  onBookRoom?: (roomId: string) => void;
  onOpenCalendar?: (roomId: string) => void;
}

function RoomEmptyState() {
  return (
    <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
      <BedDouble className="w-10 h-10 text-gray-400 mx-auto mb-2" />
      <h4 className="text-sm font-bold text-gray-800">Belum Ada Tipe Kamar</h4>
      <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
        Pemilik properti sedang menyiapkan kamar untuk properti ini.
      </p>
    </div>
  );
}

function RoomDatesBadge({ checkIn, checkOut }: { checkIn?: string; checkOut?: string }) {
  if (!checkIn || !checkOut) return null;
  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-200 self-start sm:self-auto">
      <Info className="w-3.5 h-3.5" />
      <span>{checkIn} - {checkOut}</span>
    </div>
  );
}

function RoomListHeader({ checkIn, checkOut }: { checkIn?: string; checkOut?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
      <div>
        <h2 id="daftar-kamar-properti" className="text-lg sm:text-xl font-bold text-gray-900">Pilihan Kamar Tersedia</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Pilih tipe kamar yang sesuai dengan kebutuhan menginap Anda</p>
      </div>
      <RoomDatesBadge checkIn={checkIn} checkOut={checkOut} />
    </div>
  );
}

function RoomItems({ rooms, propId, inDate, outDate, onBook, onCalendar }: { rooms: PropertyRoomSummary[]; propId: string; inDate?: string; outDate?: string; onBook?: (id: string) => void; onCalendar?: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {rooms.map((r) => (
        <PropertyDetailRoomCard key={r.id} room={r} propertyId={propId} checkIn={inDate} checkOut={outDate} onBook={onBook} onOpenCalendar={onCalendar} />
      ))}
    </div>
  );
}

export function PropertyDetailRoomList({ propertyId, rooms = [], checkIn, checkOut, onBookRoom, onOpenCalendar }: PropertyDetailRoomListProps): React.JSX.Element {
  return (
    <section id="pilihan-kamar" aria-labelledby="daftar-kamar-properti" className="py-6 border-b border-gray-100">
      <RoomListHeader checkIn={checkIn} checkOut={checkOut} />
      {rooms.length === 0 ? <RoomEmptyState /> : <RoomItems rooms={rooms} propId={propertyId} inDate={checkIn} outDate={checkOut} onBook={onBookRoom} onCalendar={onOpenCalendar} />}
    </section>
  );
}
