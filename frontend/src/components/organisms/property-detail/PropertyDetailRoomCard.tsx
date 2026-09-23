import React from 'react';
import { Users, BedDouble, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '../../atoms/Button';
import { formatRupiah } from '../../../libs/formatters';
import { PropertyRoomSummary } from '../../../modules/property/property.types';

export interface PropertyDetailRoomCardProps {
  room: PropertyRoomSummary;
  propertyId: string;
  checkIn?: string;
  checkOut?: string;
  onBook?: (roomId: string) => void;
  onOpenCalendar?: (roomId: string) => void;
}

interface RoomInfoProps {
  name: string;
  description?: string | null;
  capacity: number;
  totalUnits: number;
}

function RoomBadges({ capacity, totalUnits }: { capacity: number; totalUnits: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2 my-2">
      <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md font-medium">
        <Users className="w-3.5 h-3.5 text-gray-500" />
        <span>Maks. {capacity} Tamu</span>
      </span>
      <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs px-2.5 py-1 rounded-md font-medium border border-primary-100">
        <BedDouble className="w-3.5 h-3.5 text-primary-600" />
        <span>{totalUnits} unit tersedia</span>
      </span>
    </div>
  );
}

function RoomPricing({ basePrice }: { basePrice: number }) {
  return (
    <div className="flex flex-col text-right">
      <span className="text-xs text-gray-500">Mulai dari</span>
      <div className="text-lg sm:text-xl font-extrabold text-primary-600">
        {formatRupiah(basePrice)}
        <span className="text-xs font-normal text-gray-500 ml-1">/ malam</span>
      </div>
    </div>
  );
}

function RoomInfo({ name, description, capacity, totalUnits }: RoomInfoProps) {
  return (
    <div className="flex-1">
      <h3 className="text-base sm:text-lg font-bold text-gray-900">{name}</h3>
      {description && <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{description}</p>}
      <RoomBadges capacity={capacity} totalUnits={totalUnits} />
    </div>
  );
}

function RoomActions({ roomId, onBook, onOpenCalendar }: { roomId: string; onBook?: (id: string) => void; onOpenCalendar?: (id: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      {onOpenCalendar && (
        <Button type="button" variant="outline" size="sm" onClick={() => onOpenCalendar(roomId)} leftIcon={<Calendar className="w-3.5 h-3.5" />} className="text-xs">
          Kalender Tarif
        </Button>
      )}
      <Button type="button" variant="primary" size="sm" onClick={() => onBook?.(roomId)} rightIcon={<ArrowRight className="w-3.5 h-3.5" />} className="text-xs font-semibold">
        Pesan Kamar
      </Button>
    </div>
  );
}

function RoomSideCol({ price, id, onBook, onCalendar }: { price: number; id: string; onBook?: (id: string) => void; onCalendar?: (id: string) => void }) {
  return (
    <div className="flex md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
      <RoomPricing basePrice={price} />
      <RoomActions roomId={id} onBook={onBook} onOpenCalendar={onCalendar} />
    </div>
  );
}

export function PropertyDetailRoomCard({ room, onBook, onOpenCalendar }: PropertyDetailRoomCardProps): React.JSX.Element {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:border-primary-200 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
      <RoomInfo name={room.name} description={room.description} capacity={room.capacity} totalUnits={room.totalUnits} />
      <RoomSideCol price={room.basePrice} id={room.id} onBook={onBook} onCalendar={onOpenCalendar} />
    </div>
  );
}
