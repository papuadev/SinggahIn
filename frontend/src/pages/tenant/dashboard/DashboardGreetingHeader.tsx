import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import { formatDateID } from '../../../libs/formatters';

import { Select } from '../../../components/atoms/Select';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const YEARS = [2024, 2025, 2026, 2027, 2028];

export interface DashboardGreetingHeaderProps {
  month?: number;
  year?: number;
  onMonthChange?: (m: number) => void;
  onYearChange?: (y: number) => void;
}

function MonthBadge({ month, year }: { month: number; year: number }) {
  const currentMonthYear = formatDateID(new Date(year, month - 1, 1), 'MMMM yyyy').toUpperCase();
  return <p className="text-xs font-semibold text-primary-600 tracking-wider uppercase mb-1">{currentMonthYear}</p>;
}

function WelcomeTitle({ name }: { name?: string | null }) {
  return (
    <div>
      <p className="text-xs sm:text-sm font-medium text-gray-500">Selamat datang kembali,</p>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">{name || 'Mitra SinggahIn'}</h1>
    </div>
  );
}

function MonthYearFilter({
  month,
  year,
  onMonthChange,
  onYearChange,
}: {
  month: number;
  year: number;
  onMonthChange?: (m: number) => void;
  onYearChange?: (y: number) => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Select size="md" wrapperClassName="w-40 sm:w-44" value={month} onChange={(e) => onMonthChange?.(Number(e.target.value))} aria-label="Pilih Bulan">
        {MONTH_NAMES.map((name, idx) => (<option key={idx + 1} value={idx + 1}>{name}</option>))}
      </Select>
      <Select size="md" wrapperClassName="w-28 sm:w-32" value={year} onChange={(e) => onYearChange?.(Number(e.target.value))} aria-label="Pilih Tahun">
        {YEARS.map((yr) => (<option key={yr} value={yr}>{yr}</option>))}
      </Select>
    </div>
  );
}

function HeaderTopRow({
  name,
  month,
  year,
  onMonthChange,
  onYearChange,
}: {
  name?: string | null;
  month: number;
  year: number;
  onMonthChange?: (m: number) => void;
  onYearChange?: (y: number) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
      <div>
        <MonthBadge month={month} year={year} />
        <WelcomeTitle name={name} />
      </div>
      <div className="self-start sm:self-auto">
        <MonthYearFilter month={month} year={year} onMonthChange={onMonthChange} onYearChange={onYearChange} />
      </div>
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

export function DashboardGreetingHeader({
  month = new Date().getMonth() + 1,
  year = new Date().getFullYear(),
  onMonthChange,
  onYearChange,
}: DashboardGreetingHeaderProps = {}): React.JSX.Element {
  const { user } = useAuthStore();
  return (
    <div>
      <HeaderTopRow
        name={user?.name}
        month={month}
        year={year}
        onMonthChange={onMonthChange}
        onYearChange={onYearChange}
      />
      <SectionAction />
    </div>
  );
}
