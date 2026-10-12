import React, { useState } from 'react';
import { Eye, Search } from 'lucide-react';
import { useTenantOrders } from '../../modules/booking/hooks/useTenantOrders';
import { TenantOrderApprovalModal } from '../../modules/payment/components/TenantOrderApprovalModal';
import { getStatusBadge } from '../../modules/booking/components/OrderHistoryCard';
import { BookingStatus, Booking } from '../../modules/booking/booking.types';
import { formatRupiah, formatDateID } from '../../libs/formatters';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Select } from '../../components/atoms/Select';
import { Pagination } from '../../components/molecules/Pagination';

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

function TenantOrderFilterBar({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  sortBy: string;
  onSortChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
      <div className="relative flex-1">
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari kode pesanan, nama tamu, atau properti..."
          leftIcon={<Search className="w-4 h-4 text-gray-400" />}
        />
      </div>
      <div className="w-full sm:w-56">
        <Select value={sortBy} onChange={(e) => onSortChange(e.target.value)} size="md">
          <option value="createdAt_desc">Terbaru</option>
          <option value="createdAt_asc">Terlama</option>
          <option value="checkIn_asc">Check-in Terdekat</option>
          <option value="checkIn_desc">Check-in Terjauh</option>
          <option value="price_desc">Total Tertinggi</option>
          <option value="price_asc">Total Terendah</option>
        </Select>
      </div>
    </div>
  );
}

function OrderTableRow({ b, onSelect }: { b: Booking; onSelect: (b: Booking) => void }) {
  const badge = getStatusBadge(b.status);
  return (
    <tr className="border-b hover:bg-gray-50/50 transition-colors">
      <td className="p-3 font-mono font-bold text-gray-700 whitespace-nowrap">{b.bookingCode}</td>
      <td className="p-3"><div><p className="font-semibold text-gray-900">{b.user?.name || 'Tamu'}</p><p className="text-gray-400 text-xs">{b.user?.email}</p></div></td>
      <td className="p-3"><p className="font-medium text-gray-800">{b.property.title}</p><p className="text-gray-400 text-xs">{b.room.name}</p></td>
      <td className="p-3 text-xs text-gray-600 whitespace-nowrap">{formatDateID(b.checkInDate, 'dd MMM')} - {formatDateID(b.checkOutDate, 'dd MMM yyyy')}</td>
      <td className="p-3 font-semibold text-gray-900 whitespace-nowrap">{formatRupiah(b.totalPrice)}</td>
      <td className="p-3 whitespace-nowrap"><span className={`inline-block text-xs px-2.5 py-1 rounded-full border whitespace-nowrap font-medium ${badge.style}`}>{badge.label}</span></td>
      <td className="p-3 text-right whitespace-nowrap"><Button variant="outline" size="sm" className="p-2 h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-gray-100" onClick={() => onSelect(b)} aria-label="Tinjau" title="Tinjau Pesanan"><Eye className="w-4 h-4 text-gray-700" /></Button></td>
    </tr>
  );
}

function OrderTable({ bookings, onSelect }: { bookings: Booking[]; onSelect: (b: Booking) => void }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-xs">
      <table className="w-full text-left text-xs text-gray-600">
        <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
          <tr><th className="p-3 whitespace-nowrap">Kode</th><th className="p-3">Tamu</th><th className="p-3">Properti</th><th className="p-3 whitespace-nowrap">Tanggal</th><th className="p-3 whitespace-nowrap">Total</th><th className="p-3 whitespace-nowrap">Status</th><th className="p-3 text-right whitespace-nowrap w-12">Aksi</th></tr>
        </thead>
        <tbody>{bookings.map((b) => <OrderTableRow key={b.id} b={b} onSelect={onSelect} />)}</tbody>
      </table>
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
  if (bookings.length === 0) return <p className="text-center py-12 text-gray-400 bg-white rounded-xl border">Belum ada pesanan masuk yang sesuai dengan filter.</p>;
  return (
    <>
      <OrderTable bookings={bookings} onSelect={onSelect} />
      {meta && (
        <Pagination
          page={page}
          totalPages={meta.totalPages}
          totalItems={meta.totalItems}
          itemLabel="pesanan"
          onPageChange={onPageChange}
          className="mt-6"
        />
      )}
    </>
  );
}

export function TenantOrderManagementPage(): React.JSX.Element {
  const {
    bookings,
    meta,
    isLoading,
    status,
    setStatus,
    search,
    setSearch,
    sortBy,
    setSortBy,
    page,
    setPage,
    approve,
    reject,
    emergency,
    isActionLoading,
  } = useTenantOrders();
  const [selected, setSelected] = useState<Booking | null>(null);
  const close = () => setSelected(null);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <TenantOrderHeader />
      <div className="sticky top-16 z-30 bg-gray-50/95 backdrop-blur-md pt-2 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-gray-200/80 shadow-xs space-y-3">
        <TenantOrderFilterBar
          search={search}
          onSearchChange={setSearch}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
        <TenantTabs current={status} onSelect={setStatus} />
      </div>
      <TenantOrdersContent
        loading={isLoading}
        bookings={bookings}
        meta={meta}
        page={page}
        onPageChange={handlePageChange}
        onSelect={setSelected}
      />
      <TenantOrderApprovalModal
        isOpen={Boolean(selected)}
        onClose={close}
        booking={selected}
        onApprove={async (id) => { await approve(id); close(); }}
        onReject={async (id, r) => { await reject(id, r); close(); }}
        onEmergency={async (id, p) => { await emergency(id, p); close(); }}
        isLoading={isActionLoading}
      />
    </div>
  );
}
