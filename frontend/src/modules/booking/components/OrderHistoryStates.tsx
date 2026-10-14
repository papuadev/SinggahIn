import React from 'react';
import { ClipboardList, RotateCcw } from 'lucide-react';
import { Button } from '../../../components/atoms/Button';

export function HistoryEmpty(): React.JSX.Element {
  return (
    <div className="py-16 text-center bg-white rounded-2xl border border-gray-200 p-8 shadow-xs">
      <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <h3 className="font-bold text-gray-800 text-base">Belum Ada Riwayat Pesanan</h3>
      <p className="text-xs text-gray-500 mt-1">Pesanan akomodasi yang Anda buat akan muncul di sini.</p>
    </div>
  );
}

export function FilteredEmptyState({ onReset }: { onReset: () => void }): React.JSX.Element {
  return (
    <div className="py-16 text-center bg-white rounded-2xl border border-gray-200 p-8 shadow-xs">
      <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <h3 className="font-bold text-gray-800 text-base">Tidak Ada Pesanan yang Sesuai</h3>
      <p className="text-xs text-gray-500 mt-1 mb-4">Coba ubah kata kunci pencarian atau status filter Anda.</p>
      <Button variant="outline" size="sm" onClick={onReset} leftIcon={<RotateCcw className="w-4 h-4" />}>
        Reset Filter
      </Button>
    </div>
  );
}
