import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderHistory } from '../modules/booking/hooks/useOrderHistory';
import { OrderHistoryCard } from '../modules/booking/components/OrderHistoryCard';
import { CancelOrderModal } from '../modules/booking/components/CancelOrderModal';
import { ReviewFormModal } from '../modules/review/components/ReviewFormModal';
import { bookingApi } from '../modules/booking/services/booking.api';
import { Booking } from '../modules/booking/booking.types';
import { Pagination } from '../components/molecules/Pagination';
import { HistoryEmpty, FilteredEmptyState } from '../modules/booking/components/OrderHistoryStates';
import { OrderHistoryStickyHeader } from '../modules/booking/components/OrderHistoryStickyHeader';

function OrderListContent({ bookings, meta, page, onPageChange, navigate, setCancelId, onReview }: any) {
  return (
    <div className="space-y-4">
      {bookings.map((b: Booking) => (
        <OrderHistoryCard key={b.id} booking={b} onPay={(id) => navigate(`/orders/${id}/payment`)}
          onCancel={(id) => setCancelId(id)} onViewDetail={(id) => navigate(`/orders/${id}/payment`)}
          onReview={onReview} />
      ))}
      {meta && (
        <Pagination page={page} totalPages={meta.totalPages} totalItems={meta.totalItems} itemLabel="pesanan" onPageChange={onPageChange} className="mt-6" />
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

function useOrderPageHandlers(setPage: (p: number) => void, setSearch: (s: string) => void, setStatus: (s: any) => void, setSortBy: (s: string) => void, search: string, status: any) {
  const handlePageChange = (newPage: number) => { setPage(newPage); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleResetFilters = () => { setSearch(''); setStatus(undefined); setSortBy('createdAt_desc'); setPage(1); };
  const hasFilters = Boolean(search.trim() || status);
  return { handlePageChange, handleResetFilters, hasFilters };
}

export function OrderHistoryPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const h = useOrderHistory();
  const cancelState = useOrderCancellationState(h.refetch);
  const { handlePageChange, handleResetFilters, hasFilters } = useOrderPageHandlers(h.setPage, h.setSearch, h.setStatus, h.setSortBy, h.search, h.status);

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 space-y-6">
      <OrderHistoryStickyHeader status={h.status} setStatus={h.setStatus} search={h.search} setSearch={h.setSearch} sortBy={h.sortBy} setSortBy={h.setSortBy} />
      <OrderHistoryBody isLoading={h.isLoading} bookings={h.bookings} meta={h.meta} page={h.page} onPageChange={handlePageChange} hasFilters={hasFilters} onResetFilters={handleResetFilters} navigate={navigate} setCancelId={cancelState.setCancelId} onReview={setReviewBooking} />
      <OrderHistoryModals cancelState={cancelState} reviewBooking={reviewBooking} setReviewBooking={setReviewBooking} refetch={h.refetch} />
    </div>
  );
}
