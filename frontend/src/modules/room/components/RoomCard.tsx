import React from 'react';
import { Users, DoorClosed, Pencil, Trash2, TrendingUp, CalendarOff } from 'lucide-react';
import { Room } from '../room.types';
import { formatRupiah } from '../../../libs/formatters';
import { Button } from '../../../components/atoms/Button';

export interface RoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  onManageRates?: (room: Room) => void;
  onManageUnavailability?: (room: Room) => void;
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

function RoomPricingButtons({ room, onRates, onUnavail, disabled }: {
  room: Room;
  onRates?: (r: Room) => void;
  onUnavail?: (r: Room) => void;
  disabled?: boolean;
}): React.JSX.Element {
  return (
    <>
      {onRates && (
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => onRates(room)} leftIcon={<TrendingUp className="w-3.5 h-3.5 text-primary-600" />}>
          Tarif
        </Button>
      )}
      {onUnavail && (
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => onUnavail(room)} leftIcon={<CalendarOff className="w-3.5 h-3.5 text-rose-600" />}>
          Blokir
        </Button>
      )}
    </>
  );
}

function RoomCardActions({
  room, onEdit, onDelete, onManageRates, onManageUnavailability, disabled,
}: RoomCardProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 flex-wrap">
      <RoomPricingButtons room={room} onRates={onManageRates} onUnavail={onManageUnavailability} disabled={disabled} />
      <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => onEdit(room)} leftIcon={<Pencil className="w-3.5 h-3.5" />}>
        Ubah
      </Button>
      <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => onDelete(room)} className="text-gray-400 hover:text-rose-600 hover:bg-rose-50" leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
        Hapus
      </Button>
    </div>
  );
}

export function RoomCard(props: RoomCardProps): React.JSX.Element {
  const { room } = props;
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
      <RoomCardActions {...props} />
    </div>
  );
}
