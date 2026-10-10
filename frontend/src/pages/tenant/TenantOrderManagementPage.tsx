import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useTenantOrders } from '../../modules/booking/hooks/useTenantOrders';
import { TenantOrderApprovalModal } from '../../modules/payment/components/TenantOrderApprovalModal';
import { getStatusBadge } from '../../modules/booking/components/OrderHistoryCard';
import { BookingStatus, Booking } from '../../modules/booking/booking.types';
import { formatRupiah, formatDateID } from '../../libs/formatters';
import { Button } from '../../components/atoms/Button';

const TENANT_TABS: Array<{ label: string; value?: BookingStatus }> = [
  { label: 'Semua', value: undefined },
  { label: 'Perlu Konfirmasi', value: 'WAITING_CONFIRMATION' },
  { label: 'Dikonfirmasi', value: 'PROCESSED' },
  { label: 'Menunggu Bayar', value: 'WAITING_PAYMENT' },
  { label: 'Selesai', value: 'COMPLETED' },
  { label: 'Dibatalkan', value: 'CANCELLED' },
];

function TenantTabs({ current, onSelect }: { current?: BookingStatus; onSelect: (s?: BookingStatus) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {TENANT_TABS.map((tab) => {
        const active = current === tab.value;
        const cls = active ? 'bg-primary-600 text-white font-semibold' : 'bg-white text-gray-600 border hover:bg-gray-50';
        return <button key={tab.label} type="button" onClick={() => onSelect(tab.value)} className={`px-3.5 py-1.5 rounded-full text-xs shrink-0 cursor-pointer ${cls}`}>{tab.label}</button>;
      })}
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

function TablePagination({ meta, page, setPage }: any) {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-2 pt-4">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p: number) => p - 1)} leftIcon={<ChevronLeft className="w-4 h-4" />}>Sebelumnya</Button>
      <span className="text-xs text-gray-500">Hal. {page} dari {meta.totalPages}</span>
      <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((p: number) => p + 1)} rightIcon={<ChevronRight className="w-4 h-4" />}>Berikutnya</Button>
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

function TenantOrdersContent({ loading, bookings, meta, page, setPage, onSelect }: any) {
  if (loading) return <div className="py-12 text-center text-sm text-gray-500">Memuat data pesanan...</div>;
  if (bookings.length === 0) return <p className="text-center py-12 text-gray-400 bg-white rounded-xl border">Belum ada pesanan masuk pada status ini.</p>;
  return (
    <>
      <OrderTable bookings={bookings} onSelect={onSelect} />
      <TablePagination meta={meta} page={page} setPage={setPage} />
    </>
  );
}

export function TenantOrderManagementPage(): React.JSX.Element {
  const { bookings, meta, isLoading, status, setStatus, page, setPage, approve, reject, emergency, isActionLoading } = useTenantOrders();
  const [selected, setSelected] = useState<Booking | null>(null);
  const close = () => setSelected(null);
  return (
    <div className="space-y-6">
      <TenantOrderHeader />
      <TenantTabs current={status} onSelect={setStatus} />
      <TenantOrdersContent loading={isLoading} bookings={bookings} meta={meta} page={page} setPage={setPage} onSelect={setSelected} />
      <TenantOrderApprovalModal isOpen={Boolean(selected)} onClose={close} booking={selected} onApprove={async (id) => { await approve(id); close(); }} onReject={async (id, r) => { await reject(id, r); close(); }} onEmergency={async (id, p) => { await emergency(id, p); close(); }} isLoading={isActionLoading} />
    </div>
  );
}
