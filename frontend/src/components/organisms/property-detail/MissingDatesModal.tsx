import React from 'react';
import { Calendar } from 'lucide-react';
import { Modal } from '../../molecules/Modal';
import { Button } from '../../atoms/Button';

export interface MissingDatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPickDates?: () => void;
}

function ModalPromptText(): React.JSX.Element {
  return (
    <div className="space-y-1">
      <h4 className="font-bold text-gray-900 text-base">Tentukan Tanggal Menginap Anda</h4>
      <p className="text-sm text-gray-600 leading-relaxed max-w-xs mx-auto">
        Silakan pilih tanggal <strong>check-in</strong> dan <strong>check-out</strong> terlebih dahulu sebelum checkout.
      </p>
    </div>
  );
}

function MissingDatesBody({ onAction }: { onAction: () => void }): React.JSX.Element {
  return (
    <div className="space-y-4 text-center py-2">
      <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
        <Calendar className="w-6 h-6" />
      </div>
      <ModalPromptText />
      <div className="pt-2">
        <Button variant="primary" className="w-full font-bold" onClick={onAction}>Pilih Tanggal Sekarang</Button>
      </div>
    </div>
  );
}

export function MissingDatesModal({ isOpen, onClose, onPickDates }: MissingDatesModalProps): React.JSX.Element {
  const handleAction = () => { onClose(); onPickDates?.(); };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tanggal Belum Dipilih">
      <MissingDatesBody onAction={handleAction} />
    </Modal>
  );
}
