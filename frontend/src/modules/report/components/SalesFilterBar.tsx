import React from 'react';
import { Filter, RotateCcw, Database } from 'lucide-react';
import { SalesGroupBy, SalesSortOption } from '../report.types';
import { Button } from '../../../components/atoms/Button';
import { Select } from '../../../components/atoms/Select';
import { DatePickerInput } from '../../../components/molecules/DatePickerInput';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

interface SalesFilterBarProps {
  startDate: string;
  endDate: string;
  month: number;
  year: number;
  isAllData: boolean;
  groupBy: SalesGroupBy;
  propertyId: string;
  sortBy: SalesSortOption;
  properties?: { id: string; title: string }[];
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
  onToggleAllData: () => void;
  onGroupByChange: (g: SalesGroupBy) => void;
  onPropertyIdChange: (p: string) => void;
  onSortByChange: (s: SalesSortOption) => void;
  onReset: () => void;
}

function MonthSelect({ m, isAll, onM }: { m: number; isAll: boolean; onM: (v: number) => void }) {
  return (
    <div>
      <label htmlFor="sales-month" className="block text-xs font-medium text-gray-600 mb-1.5">Bulan</label>
      <Select id="sales-month" value={m} disabled={isAll} onChange={(e) => onM(Number(e.target.value))}>
        {MONTH_NAMES.map((name, idx) => (<option key={idx + 1} value={idx + 1}>{name}</option>))}
      </Select>
    </div>
  );
}

function YearSelect({ y, isAll, onY }: { y: number; isAll: boolean; onY: (v: number) => void }) {
  const years = [2024, 2025, 2026, 2027, 2028];
  return (
    <div>
      <label htmlFor="sales-year" className="block text-xs font-medium text-gray-600 mb-1.5">Tahun</label>
      <Select id="sales-year" value={y} disabled={isAll} onChange={(e) => onY(Number(e.target.value))}>
        {years.map((yr) => (<option key={yr} value={yr}>{yr}</option>))}
      </Select>
    </div>
  );
}

function StartDateField({ s, isAll, onS }: { s: string; isAll: boolean; onS: (v: string) => void }) {
  return (
    <div>
      <label htmlFor="sales-start-date" className="block text-xs font-medium text-gray-600 mb-1.5">Dari Tanggal</label>
      <DatePickerInput
        id="sales-start-date" value={s} disabled={isAll} onChange={onS}
        placeholder="dd/mm/yyyy" aria-label="Dari Tanggal"
      />
    </div>
  );
}

function EndDateField({ e, isAll, onE }: { e: string; isAll: boolean; onE: (v: string) => void }) {
  return (
    <div>
      <label htmlFor="sales-end-date" className="block text-xs font-medium text-gray-600 mb-1.5">Sampai Tanggal</label>
      <DatePickerInput
        id="sales-end-date" value={e} disabled={isAll} onChange={onE}
        placeholder="dd/mm/yyyy" align="right" aria-label="Sampai Tanggal"
      />
    </div>
  );
}

function GroupSelect({ g, onG }: { g: SalesGroupBy; onG: (v: SalesGroupBy) => void }) {
  return (
    <div>
      <label htmlFor="sales-group" className="block text-xs font-medium text-gray-600 mb-1.5">Grup Laporan</label>
      <Select id="sales-group" value={g} onChange={(e) => onG(e.target.value as SalesGroupBy)}>
        <option value="PROPERTY">Per Properti</option>
        <option value="TRANSACTION">Per Transaksi</option>
        <option value="USER">Per Pengguna</option>
      </Select>
    </div>
  );
}

function PropertySelect({ p, list, onP }: { p: string; list?: { id: string; title: string }[]; onP: (v: string) => void }) {
  return (
    <div>
      <label htmlFor="sales-property" className="block text-xs font-medium text-gray-600 mb-1.5">Pilih Properti</label>
      <Select id="sales-property" value={p} onChange={(e) => onP(e.target.value)}>
        <option value="">Semua Properti</option>
        {list?.map((item) => (<option key={item.id} value={item.id}>{item.title}</option>))}
      </Select>
    </div>
  );
}

function SortSelect({ s, onS }: { s: SalesSortOption; onS: (v: SalesSortOption) => void }) {
  return (
    <div>
      <label htmlFor="sales-sort" className="block text-xs font-medium text-gray-600 mb-1.5">Urutan</label>
      <Select id="sales-sort" value={s} onChange={(e) => onS(e.target.value as SalesSortOption)}>
        <option value="TERTINGGI">Tertinggi</option>
        <option value="TERENDAH">Terendah</option>
        <option value="TERBARU">Terbaru</option>
        <option value="TERLAMA">Terlama</option>
      </Select>
    </div>
  );
}

function ActionButtons({ isAll, onToggle, onReset }: { isAll: boolean; onToggle: () => void; onReset: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <Button variant={isAll ? 'primary' : 'outline'} onClick={onToggle} className="w-full h-10 text-xs sm:text-sm" leftIcon={<Database className="w-4 h-4" />}>
        Semua Data
      </Button>
      <Button variant="outline" onClick={onReset} className="w-full h-10 text-xs sm:text-sm" leftIcon={<RotateCcw className="w-4 h-4" />}>
        Reset
      </Button>
    </div>
  );
}

function FilterHeader({ isAll }: { isAll: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-primary-600" />
        <span className="text-sm font-semibold text-gray-800">Filter Laporan Penjualan</span>
      </div>
      {isAll && (
        <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full border border-primary-200">
          Mode: Semua Data
        </span>
      )}
    </div>
  );
}

function DateFilterRow(p: SalesFilterBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <MonthSelect m={p.month} isAll={p.isAllData} onM={p.onMonthChange} />
      <YearSelect y={p.year} isAll={p.isAllData} onY={p.onYearChange} />
      <StartDateField s={p.startDate} isAll={p.isAllData} onS={p.onStartDateChange} />
      <EndDateField e={p.endDate} isAll={p.isAllData} onE={p.onEndDateChange} />
    </div>
  );
}

function OptionFilterRow(p: SalesFilterBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end pt-1">
      <GroupSelect g={p.groupBy} onG={p.onGroupByChange} />
      <PropertySelect p={p.propertyId} list={p.properties} onP={p.onPropertyIdChange} />
      <SortSelect s={p.sortBy} onS={p.onSortByChange} />
      <ActionButtons isAll={p.isAllData} onToggle={p.onToggleAllData} onReset={p.onReset} />
    </div>
  );
}

export function SalesFilterBar(props: SalesFilterBarProps): React.JSX.Element {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
      <FilterHeader isAll={props.isAllData} />
      <DateFilterRow {...props} />
      <OptionFilterRow {...props} />
    </div>
  );
}
