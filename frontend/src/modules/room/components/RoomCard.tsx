import React from 'react';
import { Users, DoorClosed, Pencil, Trash2 } from 'lucide-react';
import { Room } from '../room.types';
import { formatRupiah } from '../../../libs/formatters';
import { Button } from '../../../components/atoms/Button';

export interface RoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  disabled?: boolean;
}

function RoomMetaBadges({ capacity, totalUnits }: { capacity: number; totalUnits: number }): React.JSX.Element {
  return (
    <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-600 flex-wrap">
      <span className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 px-2 py-1 rounded-md">
        <Users className="w-3.5 h-3.5 text-primary-600" />
        {capacity} Tamu
      </span>
      <span className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 px-2 py-1 rounded-md">
        <DoorClosed className="w-3.5 h-3.5 text-primary-600" />
        {totalUnits} Unit Tersedia
      </span>
    </div>
  );
}

function RoomCardActions({ room, onEdit, onDelete, disabled }: RoomCardProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
      <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => onEdit(room)} leftIcon={<Pencil className="w-3.5 h-3.5" />}>
        Ubah
      </Button>
      <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => onDelete(room)} className="text-gray-400 hover:text-rose-600 hover:bg-rose-50" leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
        Hapus
      </Button>
    </div>
  );
}

export function RoomCard({ room, onEdit, onDelete, disabled }: RoomCardProps): React.JSX.Element {
  return (
    <div className="p-4 rounded-xl border border-gray-200 bg-white hover:border-primary-200 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1.5 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-bold text-gray-900 text-base">{room.name}</h4>
          <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md shrink-0">
            {formatRupiah(room.basePrice)} / malam
          </span>
        </div>
        {room.description && <p className="text-xs text-gray-500 line-clamp-2">{room.description}</p>}
        <RoomMetaBadges capacity={room.capacity} totalUnits={room.totalUnits} />
      </div>
      <RoomCardActions room={room} onEdit={onEdit} onDelete={onDelete} disabled={disabled} />
    </div>
  );
}
