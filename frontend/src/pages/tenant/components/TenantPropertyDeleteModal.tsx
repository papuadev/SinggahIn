import React from 'react';
import { Property } from '../../../modules/property/property.types';
import { Modal } from '../../../components/molecules/Modal';
import { Button } from '../../../components/atoms/Button';

function DeleteFooter({ onClose, onConfirm, isDeleting }: { onClose: () => void; onConfirm: () => void; isDeleting: boolean }) {
  return (
    <>
      <Button variant="ghost" onClick={onClose} disabled={isDeleting}>Batal</Button>
      <Button variant="danger" onClick={onConfirm} isLoading={isDeleting}>Hapus Properti</Button>
    </>
  );
}

export function TenantPropertyDeleteModal({
  target, isDeleting, onClose, onConfirm,
}: {
  target: Property | null; isDeleting: boolean; onClose: () => void; onConfirm: () => void;
}): React.JSX.Element {
  return (
    <Modal
      isOpen={Boolean(target)}
      onClose={onClose}
      title="Hapus Properti"
      description={`Yakin ingin menghapus properti "${target?.title}"?`}
      footer={<DeleteFooter onClose={onClose} onConfirm={onConfirm} isDeleting={isDeleting} />}
    >
      <p className="text-sm text-gray-600">Seluruh data kamar dan konfigurasi tarif properti ini akan terhapus secara permanen.</p>
    </Modal>
  );
}
