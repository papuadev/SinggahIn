import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Room } from '../room.types';
import { Modal } from '../../../components/molecules/Modal';
import { Button } from '../../../components/atoms/Button';

export interface RoomDeleteConfirmModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
}

function ConfirmFooter({ onClose, onConfirm, isLoading }: {
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isLoading: boolean;
}): React.JSX.Element {
  return (
    <div className="flex justify-end gap-2 w-full">
      <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
        Batal
      </Button>
      <Button variant="danger" size="sm" onClick={onConfirm} isLoading={isLoading}>
        Ya, Hapus Kamar
      </Button>
    </div>
  );
}

export function RoomDeleteConfirmModal({
  room,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: RoomDeleteConfirmModalProps): React.JSX.Element {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hapus Tipe Kamar"
      footer={<ConfirmFooter onClose={onClose} onConfirm={onConfirm} isLoading={isLoading} />}
    >
      <div className="flex items-start gap-3 text-sm text-gray-600">
        <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
        <p>
          Apakah Anda yakin ingin menghapus tipe kamar{' '}
          <strong className="text-gray-900">{room?.name}</strong>? Data tipe kamar yang dihapus
          tidak dapat dipulihkan kembali.
        </p>
      </div>
    </Modal>
  );
}
