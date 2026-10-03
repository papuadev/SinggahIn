import React from 'react';
import { useRoomActions } from '../hooks/useRoomActions';
import { RoomFormModal } from './RoomFormModal';
import { RoomDeleteConfirmModal } from './RoomDeleteConfirmModal';
import { PeakSeasonRateModal } from './PeakSeasonRateModal';
import { RoomUnavailabilityModal } from './RoomUnavailabilityModal';

export interface RoomModalsSectionProps {
  propertyId: string;
  actions: ReturnType<typeof useRoomActions>;
}

function FormModalPart({ actions }: { actions: ReturnType<typeof useRoomActions> }): React.JSX.Element {
  return (
    <RoomFormModal
      isOpen={actions.isFormOpen}
      onClose={actions.closeForm}
      onSubmit={actions.onSubmitForm}
      initialData={actions.editingRoom}
      isLoading={actions.isFormLoading}
      title={actions.editingRoom ? 'Ubah Tipe Kamar' : 'Tambah Tipe Kamar'}
    />
  );
}

function DeleteModalPart({ actions }: { actions: ReturnType<typeof useRoomActions> }): React.JSX.Element {
  return (
    <RoomDeleteConfirmModal
      room={actions.deletingRoom}
      isOpen={Boolean(actions.deletingRoom)}
      onClose={() => actions.setDeletingRoom(null)}
      onConfirm={actions.onConfirmDelete}
      isLoading={actions.isDeleteLoading}
    />
  );
}

function PeakSeasonModalPart({ propertyId, actions }: RoomModalsSectionProps): React.JSX.Element {
  return (
    <PeakSeasonRateModal
      roomId={actions.rateRoom?.id || ''}
      roomName={actions.rateRoom?.name || ''}
      propertyId={propertyId}
      isOpen={Boolean(actions.rateRoom)}
      onClose={() => actions.setRateRoom(null)}
    />
  );
}

function UnavailabilityModalPart({ actions }: { actions: ReturnType<typeof useRoomActions> }): React.JSX.Element {
  return (
    <RoomUnavailabilityModal
      roomId={actions.unavailRoom?.id || ''}
      roomName={actions.unavailRoom?.name || ''}
      isOpen={Boolean(actions.unavailRoom)}
      onClose={() => actions.setUnavailRoom(null)}
    />
  );
}

export function RoomModalsSection(props: RoomModalsSectionProps): React.JSX.Element {
  return (
    <>
      <FormModalPart actions={props.actions} />
      <DeleteModalPart actions={props.actions} />
      <PeakSeasonModalPart {...props} />
      <UnavailabilityModalPart actions={props.actions} />
    </>
  );
}
