import { useState } from 'react';
import { Room } from '../room.types';
import { RoomFormData } from '../schemas/room.schema';
import { useCreateRoom, useUpdateRoom, useDeleteRoom } from './useRooms';

export function useRoomModalState() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const [rateRoom, setRateRoom] = useState<Room | null>(null);
  const [unavailRoom, setUnavailRoom] = useState<Room | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const openCreate = () => { setActionError(null); setEditingRoom(null); setIsFormOpen(true); };
  const openEdit = (r: Room) => { setActionError(null); setEditingRoom(r); setIsFormOpen(true); };
  const closeForm = () => { setIsFormOpen(false); setEditingRoom(null); };
  return {
    isFormOpen, editingRoom, deletingRoom, setDeletingRoom, rateRoom, setRateRoom,
    unavailRoom, setUnavailRoom, actionError, setActionError, openCreate, openEdit, closeForm,
  };
}

async function saveRoom(
  data: RoomFormData,
  editingRoom: Room | null,
  update: { mutateAsync: (d: RoomFormData) => Promise<unknown> },
  create: { mutateAsync: (d: RoomFormData) => Promise<unknown> }
): Promise<void> {
  if (editingRoom) await update.mutateAsync(data);
  else await create.mutateAsync(data);
}

async function removeRoom(
  room: Room,
  del: { mutateAsync: (id: string) => Promise<unknown> }
): Promise<void> {
  await del.mutateAsync(room.id);
}

function createSubmitHandler(
  modal: ReturnType<typeof useRoomModalState>,
  update: { mutateAsync: (d: RoomFormData) => Promise<unknown> },
  create: { mutateAsync: (d: RoomFormData) => Promise<unknown> }
) {
  return async (d: RoomFormData) => {
    try {
      modal.setActionError(null);
      await saveRoom(d, modal.editingRoom, update, create);
      modal.closeForm();
    } catch (err: unknown) {
      modal.setActionError(err instanceof Error ? err.message : 'Gagal menyimpan kamar');
    }
  };
}

function createDeleteHandler(
  modal: ReturnType<typeof useRoomModalState>,
  del: { mutateAsync: (id: string) => Promise<unknown> }
) {
  return async () => {
    if (!modal.deletingRoom) return;
    try {
      modal.setActionError(null);
      await removeRoom(modal.deletingRoom, del);
      modal.setDeletingRoom(null);
    } catch (err: unknown) {
      modal.setActionError(err instanceof Error ? err.message : 'Gagal menghapus kamar');
    }
  };
}

export function useRoomActions(propertyId: string) {
  const modal = useRoomModalState();
  const createMut = useCreateRoom(propertyId);
  const updateMut = useUpdateRoom(propertyId, modal.editingRoom?.id || '');
  const deleteMut = useDeleteRoom(propertyId);
  const onSubmitForm = createSubmitHandler(modal, updateMut, createMut);
  const onConfirmDelete = createDeleteHandler(modal, deleteMut);
  return {
    ...modal, onSubmitForm, onConfirmDelete,
    isFormLoading: createMut.isPending || updateMut.isPending,
    isDeleteLoading: deleteMut.isPending,
  };
}
