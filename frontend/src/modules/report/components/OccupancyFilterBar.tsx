import React from 'react';
import { Calendar } from 'lucide-react';
import { Select } from '../../../components/atoms/Select';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

interface OccupancyFilterBarProps {
  month: number;
  year: number;
  propertyId: string;
  properties?: { id: string; title: string }[];
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
  onPropertyChange: (p: string) => void;
}

function MonthSelector({ m, onM }: { m: number; onM: (v: number) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">Bulan</label>
      <Select size="sm" value={m} onChange={(e) => onM(Number(e.target.value))}>
        {MONTH_NAMES.map((name, idx) => (<option key={idx + 1} value={idx + 1}>{name}</option>))}
      </Select>
    </div>
  );
}

function YearSelector({ y, onY }: { y: number; onY: (v: number) => void }) {
  const years = [2024, 2025, 2026, 2027, 2028];
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">Tahun</label>
      <Select size="sm" value={y} onChange={(e) => onY(Number(e.target.value))}>
        {years.map((yr) => (<option key={yr} value={yr}>{yr}</option>))}
      </Select>
    </div>
  );
}

function PropertyFilterSelect({ p, propsList, onP }: any) {
  return (
    <div className="w-full sm:w-auto">
      <label className="block text-xs font-medium text-gray-500 mb-1">Filter Properti</label>
      <Select size="sm" value={p} onChange={(e) => onP(e.target.value)}>
        <option value="">Semua Properti</option>
        {propsList?.map((prop: any) => (<option key={prop.id} value={prop.id}>{prop.title}</option>))}
      </Select>
    </div>
  );
}

export function OccupancyFilterBar(props: OccupancyFilterBarProps): React.JSX.Element {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
        <Calendar className="w-4 h-4 text-primary-600" />
        <span>Periode Kalender Matriks Okupansi</span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MonthSelector m={props.month} onM={props.onMonthChange} />
          <YearSelector y={props.year} onY={props.onYearChange} />
        </div>
        <PropertyFilterSelect p={props.propertyId} propsList={props.properties} onP={props.onPropertyChange} />
      </div>
    </div>
  );
}
