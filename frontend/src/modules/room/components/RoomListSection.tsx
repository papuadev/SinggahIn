import React, { useState } from 'react';
import { Plus, BedDouble } from 'lucide-react';
import { Room } from '../room.types';
import { RoomFormData } from '../schemas/room.schema';
import {
  usePropertyRooms,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
} from '../hooks/useRooms';
import { RoomCard } from './RoomCard';
import { RoomFormModal } from './RoomFormModal';
import { RoomDeleteConfirmModal } from './RoomDeleteConfirmModal';
import { PeakSeasonRateModal } from './PeakSeasonRateModal';
import { RoomUnavailabilityModal } from './RoomUnavailabilityModal';
import { Button } from '../../../components/atoms/Button';
import { Spinner } from '../../../components/atoms/Spinner';
import { Alert } from '../../../components/atoms/Alert';

export interface RoomListSectionProps {
  propertyId: string;
}

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

function RoomCardsView({
  rooms, onEdit, onDelete, onRates, onUnavail, isPending,
}: {
  rooms: Room[];
  onEdit: (r: Room) => void;
  onDelete: (r: Room) => void;
  onRates: (r: Room) => void;
  onUnavail: (r: Room) => void;
  isPending: boolean;
}): React.JSX.Element {
  return (
    <div className="space-y-3">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          onEdit={onEdit}
          onDelete={onDelete}
          onManageRates={onRates}
          onManageUnavailability={onUnavail}
          disabled={isPending}
        />
      ))}
    </div>
  );
}

export function RoomListSection({ propertyId }: RoomListSectionProps): React.JSX.Element {
  const { data: rooms = [], isLoading, error } = usePropertyRooms(propertyId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const [rateRoom, setRateRoom] = useState<Room | null>(null);
  const [unavailRoom, setUnavailRoom] = useState<Room | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const createMutation = useCreateRoom(propertyId);
  const updateMutation = useUpdateRoom(propertyId, editingRoom?.id || '');
  const deleteMutation = useDeleteRoom(propertyId);

  const handleOpenCreate = () => { setActionError(null); setEditingRoom(null); setIsFormOpen(true); };
  const handleOpenEdit = (r: Room) => { setActionError(null); setEditingRoom(r); setIsFormOpen(true); };
  const handleCloseForm = () => { setIsFormOpen(false); setEditingRoom(null); };

  const handleFormSubmit = async (data: RoomFormData) => {
    try {
      setActionError(null);
      if (editingRoom) await updateMutation.mutateAsync(data);
      else await createMutation.mutateAsync(data);
      handleCloseForm();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Gagal menyimpan kamar');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRoom) return;
    try {
      setActionError(null);
      await deleteMutation.mutateAsync(deletingRoom.id);
      setDeletingRoom(null);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Gagal menghapus kamar');
    }
  };

  if (isLoading) return <div className="flex justify-center items-center py-12"><Spinner size="md" /></div>;

  return (
    <div className="space-y-4">
      <RoomListHeader onAdd={handleOpenCreate} count={rooms.length} />
      {actionError && <Alert variant="error">{actionError}</Alert>}
      {error && <Alert variant="error">{(error as Error).message}</Alert>}
      {rooms.length === 0 ? <RoomListEmpty onAdd={handleOpenCreate} /> : (
        <RoomCardsView
          rooms={rooms}
          onEdit={handleOpenEdit}
          onDelete={setDeletingRoom}
          onRates={setRateRoom}
          onUnavail={setUnavailRoom}
          isPending={deleteMutation.isPending}
        />
      )}
      <RoomFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingRoom}
        isLoading={createMutation.isPending || updateMutation.isPending}
        title={editingRoom ? 'Ubah Tipe Kamar' : 'Tambah Tipe Kamar'}
      />
      <RoomDeleteConfirmModal
        room={deletingRoom}
        isOpen={Boolean(deletingRoom)}
        onClose={() => setDeletingRoom(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
      <PeakSeasonRateModal
        roomId={rateRoom?.id || ''}
        roomName={rateRoom?.name || ''}
        propertyId={propertyId}
        isOpen={Boolean(rateRoom)}
        onClose={() => setRateRoom(null)}
      />
      <RoomUnavailabilityModal
        roomId={unavailRoom?.id || ''}
        roomName={unavailRoom?.name || ''}
        isOpen={Boolean(unavailRoom)}
        onClose={() => setUnavailRoom(null)}
      />
    </div>
  );
}
