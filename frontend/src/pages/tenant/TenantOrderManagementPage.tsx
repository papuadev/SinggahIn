import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useTenantOrders } from '../../modules/booking/hooks/useTenantOrders';
import { TenantOrderApprovalModal } from '../../modules/payment/components/TenantOrderApprovalModal';
import { BookingStatus, Booking } from '../../modules/booking/booking.types';
import { Input } from '../../components/atoms/Input';
import { Select } from '../../components/atoms/Select';
import { Pagination } from '../../components/molecules/Pagination';
import { TenantOrderTable } from './orders/TenantOrderTable';

const TENANT_TABS: Array<{ label: string; value?: BookingStatus }> = [
  { label: 'Semua', value: undefined },
  { label: 'Perlu Konfirmasi', value: 'WAITING_CONFIRMATION' },
  { label: 'Dikonfirmasi', value: 'PROCESSED' },
  { label: 'Menunggu Bayar', value: 'WAITING_PAYMENT' },
  { label: 'Selesai', value: 'COMPLETED' },
  { label: 'Dibatalkan', value: 'CANCELLED' },
  { label: 'Ditolak', value: 'REJECTED' },
];

function TenantTabs({ current, onSelect }: { current?: BookingStatus; onSelect: (s?: BookingStatus) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none items-center">
      <span className="text-xs font-medium text-gray-500 mr-1 shrink-0">Status:</span>
      {TENANT_TABS.map((tab) => {
        const active = current === tab.value;
        const cls = active ? 'bg-primary-600 text-white font-semibold' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50';
        return <button key={tab.label} type="button" onClick={() => onSelect(tab.value)} className={`px-3 py-1 rounded-full text-xs shrink-0 cursor-pointer transition-colors ${cls}`}>{tab.label}</button>;
      })}
    </div>
  );
}

function SearchBox({ search, onChange }: { search: string; onChange: (v: string) => void }) {
  return (
    <div className="relative flex-1">
      <Input
        value={search} onChange={(e) => onChange(e.target.value)}
        placeholder="Cari kode pesanan, nama tamu, atau properti..."
        leftIcon={<Search className="w-4 h-4 text-gray-400" />}
      />
    </div>
  );
}

function SortBox({ sortBy, onChange }: { sortBy: string; onChange: (v: string) => void }) {
  return (
    <div className="w-full sm:w-56">
      <Select value={sortBy} onChange={(e) => onChange(e.target.value)} size="md">
        <option value="createdAt_desc">Terbaru</option>
        <option value="createdAt_asc">Terlama</option>
        <option value="checkIn_asc">Check-in Terdekat</option>
        <option value="checkIn_desc">Check-in Terjauh</option>
        <option value="price_desc">Total Tertinggi</option>
        <option value="price_asc">Total Terendah</option>
      </Select>
    </div>
  );
}

function TenantOrderFilterBar({ search, onSearchChange, sortBy, onSortChange }: any) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
      <SearchBox search={search} onChange={onSearchChange} />
      <SortBox sortBy={sortBy} onChange={onSortChange} />
    </div>
  );
}

function TenantOrderHeader() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Kelola Pesanan Masuk</h1>
      <p className="text-sm text-gray-500">Tinjau reservasi, verifikasi bukti bayar transfer, dan kelola alokasi properti Anda.</p>
    </div>
  );
}

function TenantOrdersContent({ loading, bookings, meta, page, onPageChange, onSelect }: any) {
  if (loading) return <div className="py-12 text-center text-sm text-gray-500">Memuat data pesanan...</div>;
  if (bookings.length === 0) return <p className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-xs">Belum ada pesanan masuk yang sesuai dengan filter.</p>;
  return (
    <>
      <TenantOrderTable bookings={bookings} onSelect={onSelect} />
      {meta && <Pagination page={page} totalPages={meta.totalPages} totalItems={meta.totalItems} itemLabel="pesanan" onPageChange={onPageChange} className="mt-6" />}
    </>
  );
}

function StickyFilterBar({ search, setSearch, sortBy, setSortBy, status, setStatus }: any) {
  return (
    <div className="sticky top-16 z-30 bg-gray-50/95 backdrop-blur-md pt-2 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-gray-200/80 shadow-xs space-y-3">
      <TenantOrderFilterBar search={search} onSearchChange={setSearch} sortBy={sortBy} onSortChange={setSortBy} />
      <TenantTabs current={status} onSelect={setStatus} />
    </div>
  );
}

function OrderApprovalModalWrapper({ selected, close, approve, reject, emergency, isLoading }: any) {
  return (
    <TenantOrderApprovalModal
      isOpen={Boolean(selected)} onClose={close} booking={selected}
      onApprove={async (id) => { await approve(id); close(); }}
      onReject={async (id, r) => { await reject(id, r); close(); }}
      onEmergency={async (id, p) => { await emergency(id, p); close(); }}
      isLoading={isLoading}
    />
  );
}

export function TenantOrderManagementPage(): React.JSX.Element {
  const o = useTenantOrders(10, true);
  const [selected, setSelected] = useState<Booking | null>(null);
  const close = () => setSelected(null);
  const onPageChange = (p: number) => { o.setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="space-y-6">
      <TenantOrderHeader />
      <StickyFilterBar search={o.search} setSearch={o.setSearch} sortBy={o.sortBy} setSortBy={o.setSortBy} status={o.status} setStatus={o.setStatus} />
      <TenantOrdersContent loading={o.isLoading} bookings={o.bookings} meta={o.meta} page={o.page} onPageChange={onPageChange} onSelect={setSelected} />
      <OrderApprovalModalWrapper selected={selected} close={close} approve={o.approve} reject={o.reject} emergency={o.emergency} isLoading={o.isActionLoading} />
    </div>
  );
}
