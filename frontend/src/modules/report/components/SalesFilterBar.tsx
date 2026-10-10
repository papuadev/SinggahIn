import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { SalesGroupBy, SortOrder } from '../report.types';
import { Button } from '../../../components/atoms/Button';

interface SalesFilterBarProps {
  startDate: string;
  endDate: string;
  groupBy: SalesGroupBy;
  propertyId: string;
  sortOrder: SortOrder;
  properties?: { id: string; title: string }[];
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onGroupByChange: (val: SalesGroupBy) => void;
  onPropertyIdChange: (val: string) => void;
  onSortOrderChange: (val: SortOrder) => void;
  onReset: () => void;
}

function DateInputs({ s, e, onS, onE }: { s: string; e: string; onS: (v: string) => void; onE: (v: string) => void }) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      <div className="w-full sm:w-auto">
        <label className="block text-xs font-medium text-gray-500 mb-1">Dari Tanggal</label>
        <input
          type="date" value={s} onChange={(e) => onS(e.target.value)}
          className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-primary-500"
        />
      </div>
      <div className="w-full sm:w-auto">
        <label className="block text-xs font-medium text-gray-500 mb-1">Sampai Tanggal</label>
        <input
          type="date" value={e} onChange={(e) => onE(e.target.value)}
          className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-primary-500"
        />
      </div>
    </div>
  );
}

function GroupAndPropertySelectors({ g, p, propsList, onG, onP }: any) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      <div className="w-full sm:w-auto">
        <label className="block text-xs font-medium text-gray-500 mb-1">Grup Laporan</label>
        <select
          value={g} onChange={(e) => onG(e.target.value as SalesGroupBy)}
          className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-1 focus:ring-primary-500"
        >
          <option value="PROPERTY">Per Properti</option>
          <option value="TRANSACTION">Per Transaksi</option>
          <option value="USER">Per Pengguna</option>
        </select>
      </div>
      <div className="w-full sm:w-auto">
        <label className="block text-xs font-medium text-gray-500 mb-1">Pilih Properti</label>
        <select
          value={p} onChange={(e) => onP(e.target.value)}
          className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-1 focus:ring-primary-500"
        >
          <option value="">Semua Properti</option>
          {propsList?.map((prop: any) => (<option key={prop.id} value={prop.id}>{prop.title}</option>))}
        </select>
      </div>
    </div>
  );
}

function SortAndActionButtons({ o, onO, onReset }: any) {
  return (
    <div className="flex items-end gap-2 w-full sm:w-auto pt-2 sm:pt-0">
      <div className="w-full sm:w-auto">
        <label className="block text-xs font-medium text-gray-500 mb-1">Urutan</label>
        <select
          value={o} onChange={(e) => onO(e.target.value as SortOrder)}
          className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-1 focus:ring-primary-500"
        >
          <option value="desc">Tertinggi / Terbaru</option>
          <option value="asc">Terendah / Terlama</option>
        </select>
      </div>
      <Button variant="outline" size="sm" onClick={onReset} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
        Reset
      </Button>
    </div>
  );
}

export function SalesFilterBar(props: SalesFilterBarProps): React.JSX.Element {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
        <Filter className="w-4 h-4 text-primary-600" />
        <span>Filter Laporan Penjualan</span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DateInputs s={props.startDate} e={props.endDate} onS={props.onStartDateChange} onE={props.onEndDateChange} />
        <GroupAndPropertySelectors
          g={props.groupBy} p={props.propertyId} propsList={props.properties}
          onG={props.onGroupByChange} onP={props.onPropertyIdChange}
        />
        <SortAndActionButtons o={props.sortOrder} onO={props.onSortOrderChange} onReset={props.onReset} />
      </div>
    </div>
  );
}
