import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import { useOrderHistory } from '../modules/booking/hooks/useOrderHistory';
import { OrderHistoryCard } from '../modules/booking/components/OrderHistoryCard';
import { CancelOrderModal } from '../modules/booking/components/CancelOrderModal';
import { ReviewFormModal } from '../modules/review/components/ReviewFormModal';
import { bookingApi } from '../modules/booking/services/booking.api';
import { BookingStatus, Booking } from '../modules/booking/booking.types';
import { Button } from '../components/atoms/Button';
import { BackButton } from '../components/atoms/BackButton';

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
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {STATUS_TABS.map((tab) => {
        const active = current === tab.value;
        const cls = active ? 'bg-primary-600 text-white font-semibold' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50';
        return (
          <button key={tab.label} type="button" onClick={() => onSelect(tab.value)} className={`px-3.5 py-1.5 rounded-full text-xs shrink-0 cursor-pointer transition-colors ${cls}`}>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function HistoryEmpty() {
  return (
    <div className="py-16 text-center bg-white rounded-2xl border border-gray-200 p-8">
      <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <h3 className="font-bold text-gray-800 text-base">Belum Ada Riwayat Pesanan</h3>
      <p className="text-xs text-gray-500 mt-1">Pesanan akomodasi yang Anda buat akan muncul di sini.</p>
    </div>
  );
}

function HistoryPagination({ meta, page, setPage }: any) {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-2 pt-4">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p: number) => p - 1)} leftIcon={<ChevronLeft className="w-4 h-4" />}>Sebelumnya</Button>
      <span className="text-xs text-gray-500">Hal. {page} dari {meta.totalPages}</span>
      <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((p: number) => p + 1)} rightIcon={<ChevronRight className="w-4 h-4" />}>Berikutnya</Button>
    </div>
  );
}

function OrderListContent({ bookings, meta, page, setPage, navigate, setCancelId, onReview }: any) {
  return (
    <div className="space-y-4">
      {bookings.map((b: Booking) => (
        <OrderHistoryCard key={b.id} booking={b} onPay={(id) => navigate(`/orders/${id}/payment`)}
          onCancel={(id) => setCancelId(id)} onViewDetail={(id) => navigate(`/orders/${id}/payment`)}
          onReview={onReview} />
      ))}
      <HistoryPagination meta={meta} page={page} setPage={setPage} />
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

function OrderHistoryHeader({ status, setStatus }: { status?: BookingStatus; setStatus: (s?: BookingStatus) => void }) {
  return (
    <>
      <BackButton fallbackUrl="/" />
      <h1 className="text-2xl font-bold text-gray-900">Riwayat Pesanan Saya</h1>
      <StatusFilterTabs current={status} onSelect={setStatus} />
    </>
  );
}

function OrderHistoryBody({ isLoading, bookings, ...rest }: any) {
  if (isLoading) return <div className="py-12 text-center text-sm text-gray-500">Memuat pesanan...</div>;
  if (bookings.length === 0) return <HistoryEmpty />;
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
  const { bookings, meta, isLoading, status, setStatus, page, setPage, refetch } = useOrderHistory();
  const cancelState = useOrderCancellationState(refetch);
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <OrderHistoryHeader status={status} setStatus={setStatus} />
      <OrderHistoryBody isLoading={isLoading} bookings={bookings} meta={meta} page={page} setPage={setPage} navigate={navigate} setCancelId={cancelState.setCancelId} onReview={setReviewBooking} />
      <OrderHistoryModals cancelState={cancelState} reviewBooking={reviewBooking} setReviewBooking={setReviewBooking} refetch={refetch} />
    </div>
  );
}
