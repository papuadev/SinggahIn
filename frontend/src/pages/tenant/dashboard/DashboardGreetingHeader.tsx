import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import { formatDateID } from '../../../libs/formatters';

function MonthBadge() {
  const currentMonthYear = formatDateID(new Date(), 'MMMM yyyy').toUpperCase();
  return <p className="text-xs font-semibold text-primary-600 tracking-wider uppercase mb-1">{currentMonthYear}</p>;
}

function WelcomeTitle({ name }: { name?: string | null }) {
  return (
    <div className="mb-4">
      <p className="text-xs sm:text-sm font-medium text-gray-500">Selamat datang kembali,</p>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">{name || 'Mitra SinggahIn'}</h1>
    </div>
  );
}

function SectionAction() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Ringkasan properti</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Pantau performa dan reservasi terbarumu.</p>
      </div>
      <Link to="/tenant/properties/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-xs transition-colors shrink-0 self-start sm:self-auto">
        <Plus className="w-4 h-4" />
        <span>Tambah properti</span>
      </Link>
    </div>
  );
}

export function DashboardGreetingHeader(): React.JSX.Element {
  const { user } = useAuthStore();
  return (
    <div>
      <MonthBadge />
      <WelcomeTitle name={user?.name} />
      <SectionAction />
    </div>
  );
}
