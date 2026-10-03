import React from 'react';
import { Plus, BedDouble } from 'lucide-react';
import { Room } from '../room.types';
import { usePropertyRooms } from '../hooks/useRooms';
import { useRoomActions } from '../hooks/useRoomActions';
import { useRoomListFilter } from '../hooks/useRoomListFilter';
import { UseRoomListFilterReturn } from '../room-filter.types';
import { RoomCard } from './RoomCard';
import { RoomListControls } from './RoomListControls';
import { RoomPagination } from './RoomPagination';
import { RoomListEmptySearch } from './RoomListEmptySearch';
import { RoomModalsSection } from './RoomModalsSection';
import { Button } from '../../../components/atoms/Button';
import { Spinner } from '../../../components/atoms/Spinner';
import { Alert } from '../../../components/atoms/Alert';

export interface RoomListSectionProps {
  propertyId: string;
}

type CardsProps = {
  rooms: Room[];
  onEdit: (r: Room) => void;
  onDelete: (r: Room) => void;
  onRates: (r: Room) => void;
  onUnavail: (r: Room) => void;
  isPending: boolean;
};

type BodyProps = Omit<CardsProps, 'rooms'> & { filter: UseRoomListFilterReturn };

function RoomListHeader({ onAdd, count }: { onAdd: () => void; count: number }): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-gray-900">Tipe & Tarif Kamar</h3>
          <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">{count} Tipe</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">Kelola konfigurasi kamar, kapasitas tamu, dan harga dasar per malam.</p>
      </div>
      <Button type="button" variant="primary" size="sm" onClick={onAdd} leftIcon={<Plus className="w-4 h-4" />}>Tambah Tipe Kamar</Button>
    </div>
  );
}

function RoomListEmpty({ onAdd }: { onAdd: () => void }): React.JSX.Element {
  return (
    <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary-50 flex items-center justify-center text-primary-600"><BedDouble className="w-6 h-6" /></div>
      <h4 className="text-sm font-bold text-gray-900 mb-1">Belum Ada Tipe Kamar</h4>
      <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">Tambahkan minimal satu tipe kamar agar calon tamu dapat memesan properti Anda.</p>
      <Button type="button" variant="primary" size="sm" onClick={onAdd} leftIcon={<Plus className="w-4 h-4" />}>Tambah Tipe Kamar</Button>
    </div>
  );
}

function RoomCardsView({ rooms, onEdit, onDelete, onRates, onUnavail, isPending }: CardsProps): React.JSX.Element {
  return (
    <div className="space-y-3">
      {rooms.map((room) => (
        <RoomCard
          key={room.id} room={room} onEdit={onEdit} onDelete={onDelete}
          onManageRates={onRates} onManageUnavailability={onUnavail} disabled={isPending}
        />
      ))}
    </div>
  );
}

function RoomListPagination({ filter }: { filter: UseRoomListFilterReturn }): React.JSX.Element {
  return (
    <RoomPagination
      page={filter.currentPage} totalPages={filter.totalPages}
      totalItems={filter.totalFiltered} pageSize={filter.pageSize} onPageChange={filter.setCurrentPage}
    />
  );
}

function RoomListBody(p: BodyProps): React.JSX.Element {
  if (p.filter.totalFiltered === 0) {
    return <RoomListEmptySearch query={p.filter.searchQuery} onReset={p.filter.resetFilters} />;
  }
  return (
    <div className="space-y-4">
      <RoomCardsView {...p} rooms={p.filter.paginatedRooms} />
      <RoomListPagination filter={p.filter} />
    </div>
  );
}

function RoomListControlsPart({ filter }: { filter: UseRoomListFilterReturn }): React.JSX.Element {
  return (
    <RoomListControls
      searchQuery={filter.searchQuery} onSearchChange={filter.setSearchQuery}
      sortBy={filter.sortBy} onSortChange={filter.setSortBy}
    />
  );
}

type ListViewProps = {
  rooms: Room[]; filter: UseRoomListFilterReturn; actions: ReturnType<typeof useRoomActions>; onAdd: () => void;
};

function RoomListView({ rooms, filter, actions, onAdd }: ListViewProps): React.JSX.Element {
  if (rooms.length === 0) return <RoomListEmpty onAdd={onAdd} />;
  return (
    <div className="space-y-4">
      <RoomListControlsPart filter={filter} />
      <RoomListBody
        filter={filter} onEdit={actions.openEdit} onDelete={actions.setDeletingRoom}
        onRates={actions.setRateRoom} onUnavail={actions.setUnavailRoom} isPending={actions.isDeleteLoading}
      />
    </div>
  );
}

function RoomListAlerts({ actionError, error }: { actionError: string | null; error: unknown }): React.JSX.Element {
  return (
    <>
      {actionError && <Alert variant="error">{actionError}</Alert>}
      {error && <Alert variant="error">{(error as Error).message}</Alert>}
    </>
  );
}

export function RoomListSection({ propertyId }: RoomListSectionProps): React.JSX.Element {
  const { data: rooms = [], isLoading, error } = usePropertyRooms(propertyId);
  const filter = useRoomListFilter(rooms);
  const actions = useRoomActions(propertyId);
  if (isLoading) return <div className="flex justify-center items-center py-12"><Spinner size="md" /></div>;

  return (
    <div className="space-y-4">
      <RoomListHeader onAdd={actions.openCreate} count={rooms.length} />
      <RoomListAlerts actionError={actions.actionError} error={error} />
      <RoomListView rooms={rooms} filter={filter} actions={actions} onAdd={actions.openCreate} />
      <RoomModalsSection propertyId={propertyId} actions={actions} />
    </div>
  );
}
