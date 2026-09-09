import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../molecules/Modal';
import { Button } from '../atoms/Button';
import { useAuthStore } from '../../stores/auth.store';
import { Role } from '../../types/auth.types';

function getRoleLabel(role: Role): string {
  return role === 'TENANT' ? 'Pemilik (Tenant)' : 'Penyewa (User)';
}

export function AccountSwitchModal(): React.JSX.Element | null {
  const { conflict, logout, setConflict } = useAuthStore();

  if (!conflict) return null;

  const currentLabel = getRoleLabel(conflict.currentRole);
  const targetLabel = getRoleLabel(conflict.targetRole);

  const handleConfirm = async () => {
    const nextAction = conflict.onConfirm;
    await logout();
    setConflict(null);
    if (nextAction) nextAction();
  };

  const handleCancel = () => {
    setConflict(null);
  };

  return (
    <Modal
      isOpen={!!conflict}
      onClose={handleCancel}
      title="Konfirmasi Beralih Akun"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p>
            Akun Anda saat ini tercatat sebagai <strong>{currentLabel}</strong>. Sistem SinggahIn menerapkan aturan ketat <strong>1 Akun = 1 Peran Tunggal</strong>.
          </p>
        </div>
        <p className="text-sm text-gray-600">
          Untuk melanjutkan ke area atau akun <strong>{targetLabel}</strong>, Anda harus keluar dari sesi saat ini terlebih dahulu.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="md" onClick={handleCancel}>
            Tetap di Sesi Ini
          </Button>
          <Button variant="danger" size="md" onClick={handleConfirm}>
            Keluar & Beralih Peran
          </Button>
        </div>
      </div>
    </Modal>
  );
}
