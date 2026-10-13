import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Building2, RotateCcw } from 'lucide-react';
import { Button } from '../../../components/atoms/Button';

export function EmptyState(): React.JSX.Element {
  return (
    <div className="text-center py-16 bg-white rounded-xl border border-gray-200 p-8 shadow-xs">
      <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <h3 className="text-lg font-bold text-gray-900 mb-1">Belum Ada Properti</h3>
      <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">Mulai sewakan penginapan Anda dengan menambahkan properti baru.</p>
      <Link to="/tenant/properties/new">
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>Tambah Properti Pertama</Button>
      </Link>
    </div>
  );
}

export function FilteredEmptyState({ onReset }: { onReset: () => void }): React.JSX.Element {
  return (
    <div className="text-center py-16 bg-white rounded-xl border border-gray-200 p-8 shadow-xs">
      <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <h3 className="text-lg font-bold text-gray-900 mb-1">Tidak Ada Properti yang Sesuai</h3>
      <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">Tidak ada properti yang cocok dengan filter atau pencarian Anda.</p>
      <Button variant="outline" size="sm" onClick={onReset} leftIcon={<RotateCcw className="w-4 h-4" />}>Reset Filter</Button>
    </div>
  );
}
