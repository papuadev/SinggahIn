import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Search, RotateCcw } from 'lucide-react';
import { useOrderHistory } from '../modules/booking/hooks/useOrderHistory';
import { OrderHistoryCard } from '../modules/booking/components/OrderHistoryCard';
import { CancelOrderModal } from '../modules/booking/components/CancelOrderModal';
import { ReviewFormModal } from '../modules/review/components/ReviewFormModal';
import { bookingApi } from '../modules/booking/services/booking.api';
import { BookingStatus, Booking } from '../modules/booking/booking.types';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { Select } from '../components/atoms/Select';
import { BackButton } from '../components/atoms/BackButton';
import { Pagination } from '../components/molecules/Pagination';

const STATUS_TABS: Array<{ label: string; value?: BookingStatus }> = [
  { label: 'Semua', value: undefined },
  { label: 'Menunggu Pembayaran', value: 'WAITING_PAYMENT' },
  { label: 'Menunggu Konfirmasi', value: 'WAITING_CONFIRMATION' },
  { label: 'Dikonfirmasi', value: 'PROCESSED' },
  { label: 'Selesai', value: 'COMPLETED' },
  { label: 'Dibatalkan', value: 'CANCELLED' },
  { label: 'Ditolak', value: 'REJECTED' },
];

function StatusFilterTabs({ current, onSelect }: { current?: BookingStatus; onSelect: (s?: BookingStatus) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none items-center">
      <span className="text-xs font-medium text-gray-500 mr-1 shrink-0">Status:</span>
      {STATUS_TABS.map((tab) => {
        const active = current === tab.value;
        const cls = active ? 'bg-primary-600 text-white font-semibold' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50';
        return (
          <button key={tab.label} type="button" onClick={() => onSelect(tab.value)} className={`px-3 py-1 rounded-full text-xs shrink-0 cursor-pointer transition-colors ${cls}`}>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function HistoryEmpty() {
  return (
    <div className="py-16 text-center bg-white rounded-2xl border border-gray-200 p-8 shadow-xs">
      <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <h3 className="font-bold text-gray-800 text-base">Belum Ada Riwayat Pesanan</h3>
      <p className="text-xs text-gray-500 mt-1">Pesanan akomodasi yang Anda buat akan muncul di sini.</p>
    </div>
  );
}

function FilteredEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="py-16 text-center bg-white rounded-2xl border border-gray-200 p-8 shadow-xs">
      <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <h3 className="font-bold text-gray-800 text-base">Tidak Ada Pesanan yang Sesuai</h3>
      <p className="text-xs text-gray-500 mt-1 mb-4">Coba ubah kata kunci pencarian atau status filter Anda.</p>
      <Button variant="outline" size="sm" onClick={onReset} leftIcon={<RotateCcw className="w-4 h-4" />}>
        Reset Filter
      </Button>
    </div>
  );
}

function OrderListContent({ bookings, meta, page, onPageChange, navigate, setCancelId, onReview }: any) {
  return (
    <div className="space-y-4">
      {bookings.map((b: Booking) => (
        <OrderHistoryCard key={b.id} booking={b} onPay={(id) => navigate(`/orders/${id}/payment`)}
          onCancel={(id) => setCancelId(id)} onViewDetail={(id) => navigate(`/orders/${id}/payment`)}
          onReview={onReview} />
      ))}
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
    </div>
  );
}

function useOrderCancellationState(refetch: () => void) {
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const handleCancel = async (reason: string) => {
    if (!cancelId) return;
    setCancelling(true);
    try { await bookingApi.cancelBooking(cancelId, reason); refetch(); }
    finally { setCancelling(false); setCancelId(null); }
  };
  return { cancelId, setCancelId, cancelling, handleCancel };
}

interface OrderHistoryStickyHeaderProps {
  status?: BookingStatus;
  setStatus: (s?: BookingStatus) => void;
  search: string;
  setSearch: (s: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
}

function OrderHistoryStickyHeader({
  status,
  setStatus,
  search,
  setSearch,
  sortBy,
  setSortBy,
}: OrderHistoryStickyHeaderProps) {
  return (
    <div className="sticky top-16 z-30 bg-gray-50/95 backdrop-blur-md pt-2 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-gray-200/80 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          <BackButton fallbackUrl="/" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Riwayat Pesanan Saya</h1>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode pesanan atau nama penginapan..."
            leftIcon={<Search className="w-4 h-4 text-gray-400" />}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} size="md">
            <option value="createdAt_desc">Terbaru</option>
            <option value="createdAt_asc">Terlama</option>
            <option value="checkIn_asc">Check-in Terdekat</option>
            <option value="checkIn_desc">Check-in Terjauh</option>
            <option value="price_desc">Total Tertinggi</option>
            <option value="price_asc">Total Terendah</option>
          </Select>
        </div>
      </div>

      <StatusFilterTabs current={status} onSelect={setStatus} />
    </div>
  );
}

function OrderHistoryBody({ isLoading, bookings, hasFilters, onResetFilters, ...rest }: any) {
  if (isLoading) return <div className="py-12 text-center text-sm text-gray-500">Memuat pesanan...</div>;
  if (bookings.length === 0) {
    return hasFilters ? <FilteredEmptyState onReset={onResetFilters} /> : <HistoryEmpty />;
  }
  return <OrderListContent bookings={bookings} {...rest} />;
}

function OrderHistoryModals({ cancelState, reviewBooking, setReviewBooking, refetch }: any) {
  return (
    <>
      <CancelOrderModal isOpen={Boolean(cancelState.cancelId)} onClose={() => cancelState.setCancelId(null)} onConfirm={cancelState.handleCancel} isCancelling={cancelState.cancelling} />
      <ReviewFormModal isOpen={Boolean(reviewBooking)} onClose={() => { setReviewBooking(null); refetch(); }} bookingId={reviewBooking?.id || ''} propertyTitle={reviewBooking?.property?.title} />
    </>
  );
}

export function OrderHistoryPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
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
    refetch,
  } = useOrderHistory();
  const cancelState = useOrderCancellationState(refetch);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus(undefined);
    setSortBy('createdAt_desc');
    setPage(1);
  };

  const hasFilters = Boolean(search.trim() || status);

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 space-y-6">
      <OrderHistoryStickyHeader
        status={status}
        setStatus={setStatus}
        search={search}
        setSearch={setSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
      <OrderHistoryBody
        isLoading={isLoading}
        bookings={bookings}
        meta={meta}
        page={page}
        onPageChange={handlePageChange}
        hasFilters={hasFilters}
        onResetFilters={handleResetFilters}
        navigate={navigate}
        setCancelId={cancelState.setCancelId}
        onReview={setReviewBooking}
      />
      <OrderHistoryModals
        cancelState={cancelState}
        reviewBooking={reviewBooking}
        setReviewBooking={setReviewBooking}
        refetch={refetch}
      />
    </div>
  );
}
