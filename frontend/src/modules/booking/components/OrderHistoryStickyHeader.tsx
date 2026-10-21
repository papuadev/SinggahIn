import React from 'react';
import { Search } from 'lucide-react';
import { BookingStatus } from '../booking.types';
import { Input } from '../../../components/atoms/Input';
import { Select } from '../../../components/atoms/Select';
import { BackButton } from '../../../components/atoms/BackButton';

const STATUS_TABS: Array<{ label: string; value?: BookingStatus }> = [
  { label: 'Semua', value: undefined },
  { label: 'Menunggu Pembayaran', value: 'WAITING_PAYMENT' },
  { label: 'Menunggu Konfirmasi', value: 'WAITING_CONFIRMATION' },
  { label: 'Dikonfirmasi', value: 'PROCESSED' },
  { label: 'Selesai', value: 'COMPLETED' },
  { label: 'Dibatalkan', value: 'CANCELLED' },
  { label: 'Ditolak', value: 'REJECTED' },
];

function StatusTabBtn({ tab, active, onSelect }: { tab: { label: string; value?: BookingStatus }; active: boolean; onSelect: (s?: BookingStatus) => void }) {
  const cls = active ? 'bg-primary-600 text-white font-semibold' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50';
  return (
    <button type="button" onClick={() => onSelect(tab.value)} className={`px-3 py-1 rounded-full text-xs shrink-0 cursor-pointer transition-colors ${cls}`}>
      {tab.label}
    </button>
  );
}

function StatusFilterTabs({ current, onSelect }: { current?: BookingStatus; onSelect: (s?: BookingStatus) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none items-center">
      <span className="text-xs font-medium text-gray-500 mr-1 shrink-0">Status:</span>
      {STATUS_TABS.map((tab) => (<StatusTabBtn key={tab.label} tab={tab} active={current === tab.value} onSelect={onSelect} />))}
    </div>
  );
}

interface OrderHistoryStickyHeaderProps {
  status?: BookingStatus;
  setStatus: (s?: BookingStatus) => void;
  search: string;
  setSearch: (s: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
}

function HeaderSearchSortBar({ search, setSearch, sortBy, setSortBy }: Pick<OrderHistoryStickyHeaderProps, 'search' | 'setSearch' | 'sortBy' | 'setSortBy'>) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
      <div className="relative flex-1"><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari kode pesanan atau nama penginapan..." leftIcon={<Search className="w-4 h-4 text-gray-400" />} /></div>
      <div className="w-full sm:w-56">
        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} size="md">
          <option value="createdAt_desc">Terbaru</option><option value="createdAt_asc">Terlama</option>
          <option value="checkIn_asc">Check-in Terdekat</option><option value="checkIn_desc">Check-in Terjauh</option>
          <option value="price_desc">Total Tertinggi</option><option value="price_asc">Total Terendah</option>
        </Select>
      </div>
    </div>
  );
}

export function OrderHistoryStickyHeader({ status, setStatus, search, setSearch, sortBy, setSortBy }: OrderHistoryStickyHeaderProps): React.JSX.Element {
  return (
    <div className="sticky top-16 z-30 bg-gray-50/95 backdrop-blur-md pt-2 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-gray-200/80 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3"><BackButton fallbackUrl="/" /><h1 className="text-xl sm:text-2xl font-bold text-gray-900">Riwayat Pesanan Saya</h1></div>
      </div>
      <HeaderSearchSortBar search={search} setSearch={setSearch} sortBy={sortBy} setSortBy={setSortBy} />
      <StatusFilterTabs current={status} onSelect={setStatus} />
    </div>
  );
}
