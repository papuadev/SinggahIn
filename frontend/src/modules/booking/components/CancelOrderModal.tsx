import React, { useState } from 'react';
import { Modal } from '../../../components/molecules/Modal';
import { Button } from '../../../components/atoms/Button';

export interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
  isCancelling: boolean;
}

function ModalFooter({ onClose, onConfirm, isCancelling }: { onClose: () => void; onConfirm: () => void; isCancelling: boolean }) {
  return (
    <>
      <Button variant="ghost" onClick={onClose} disabled={isCancelling}>Batal</Button>
      <Button variant="danger" isLoading={isCancelling} onClick={onConfirm}>Ya, Batalkan Pesanan</Button>
    </>
  );
}

function ReasonInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-gray-700 block">Alasan Pembatalan</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
        rows={3}
        placeholder="Tulis alasan pembatalan pesanan..."
      />
    </div>
  );
}

export function CancelOrderModal({ isOpen, onClose, onConfirm, isCancelling }: CancelOrderModalProps): React.JSX.Element {
  const [reason, setReason] = useState('Perubahan jadwal rencana perjalanan');
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Batalkan Pesanan Ini?"
      description="Pesanan yang dibatalkan tidak dapat dikembalikan dan alokasi kamar akan dilepas."
      footer={<ModalFooter onClose={onClose} onConfirm={() => onConfirm(reason)} isCancelling={isCancelling} />}
    >
      <ReasonInput value={reason} onChange={setReason} />
    </Modal>
  );
}
