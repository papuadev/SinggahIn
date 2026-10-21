import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { useOrderPayment } from '../modules/booking/hooks/useOrderPayment';
import { CountdownTimerBadge } from '../modules/booking/components/CountdownTimerBadge';
import { OrderSummaryCard } from '../modules/booking/components/OrderSummaryCard';
import { ManualTransferSection } from '../modules/payment/components/ManualTransferSection';
import { MidtransPaymentSection } from '../modules/payment/components/MidtransPaymentSection';
import { PaymentMethodSwitcher } from '../modules/payment/components/PaymentMethodSwitcher';
import { CancelOrderModal } from '../modules/booking/components/CancelOrderModal';
import { CompletedStaySection } from '../modules/booking/components/CompletedStaySection';
import { ConfirmedStaySection } from '../modules/booking/components/ConfirmedStaySection';
import { CancelledStaySection } from '../modules/booking/components/CancelledStaySection';
import { ReviewFormModal } from '../modules/review/components/ReviewFormModal';
import { getStatusBadge } from '../modules/booking/components/OrderHistoryCard';
import { BookingStatus } from '../modules/booking/booking.types';
import { Button } from '../components/atoms/Button';
import { BackButton } from '../components/atoms/BackButton';
import { Alert } from '../components/atoms/Alert';

export function getPageTitle(status: BookingStatus): string {
  switch (status) {
    case 'WAITING_PAYMENT': return 'Pembayaran Pesanan';
    case 'WAITING_CONFIRMATION': return 'Menunggu Konfirmasi Pembayaran';
    case 'PROCESSED': return 'Detail Tiket & Reservasi';
    case 'COMPLETED': return 'Detail Pesanan Selesai';
    case 'CANCELLED': return 'Detail Pesanan Dibatalkan';
    case 'REJECTED': return 'Detail Pesanan Ditolak';
    default: return 'Detail Pesanan';
  }
}

function PaymentHeaderTitle({ code, status }: { code: string; status: any }) {
  const badge = getStatusBadge(status);
  return (
    <div className="flex flex-wrap justify-between items-center gap-2">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{getPageTitle(status)}</h1>
        <p className="font-mono text-sm text-gray-500">Kode: {code}</p>
      </div>
      <span className={`text-sm px-3 py-1 rounded-full font-medium border ${badge.style}`}>{badge.label}</span>
    </div>
  );
}

function PaymentHeader({ code, status }: { code: string; status: any }) {
  const isPaid = status === 'PROCESSED' || status === 'COMPLETED';
  return (
    <div className="space-y-2 pb-2">
      <BackButton fallbackUrl="/orders" to={isPaid ? '/orders' : undefined} label={isPaid ? 'Ke Daftar Pesanan' : 'Kembali ke Riwayat Pesanan'} />
      <PaymentHeaderTitle code={code} status={status} />
    </div>
  );
}

function ManualPaymentRenderer({ p, b }: any) {
  const proofUrl = b.payment?.proofImageUrl || b.payment?.paymentProofUrl;
  return (
    <ManualTransferSection
      isUploading={p.isUploading} uploadError={p.uploadError}
      uploadSuccess={p.uploadSuccess} onUpload={p.uploadProof}
      existingProofUrl={proofUrl}
    />
  );
}

function PaymentMethodRenderer({ p }: { p: ReturnType<typeof useOrderPayment> }) {
  const b = p.booking!;
  if (b.payment?.paymentMethod === 'MANUAL_TRANSFER') return <ManualPaymentRenderer p={p} b={b} />;
  return (
    <MidtransPaymentSection
      isPayingSnap={p.isPayingSnap} snapError={p.snapError}
      onPay={p.payWithSnap} isPaid={b.status === 'PROCESSED' || b.status === 'COMPLETED'}
      pendingPayment={(b as any).pendingPayment}
      isResetting={p.isResettingSnap} onReset={p.resetPaymentMethod}
      isResolving={p.isResolvingSnap}
    />
  );
}

function PaymentActions({ isWaiting, onCancel }: { isWaiting: boolean; onCancel: () => void }) {
  if (!isWaiting) return <div className="pt-2"><Link to="/orders"><Button variant="primary" size="md" className="w-full">Lihat Pesanan</Button></Link></div>;
  return (
    <div className="flex justify-between items-center pt-2">
      <Link to="/orders"><Button variant="ghost" size="sm">Kembali ke Pesanan Saya</Button></Link>
      <Button variant="danger" size="sm" onClick={onCancel}>Batalkan Pesanan</Button>
    </div>
  );
}

function PaymentWarningAlert({ reason }: { reason?: string | null }) {
  if (!reason) return null;
  return <Alert variant="warning" title="Bukti Transfer Sebelumnya Ditolak">{reason}. Silakan unggah bukti transfer baru yang valid sebelum batas waktu berakhir.</Alert>;
}

function PaymentActiveFlow({ p, onCancel }: { p: ReturnType<typeof useOrderPayment>; onCancel: () => void }) {
  const b = p.booking!;
  const isWait = b.status === 'WAITING_PAYMENT';
  return (
    <div className="space-y-6">
      {isWait && <PaymentWarningAlert reason={b.cancellationReason} />}
      {isWait && <CountdownTimerBadge timer={p.timer} />}
      {isWait && <PaymentMethodSwitcher currentMethod={b.payment?.paymentMethod || 'MANUAL_TRANSFER'} isSwitching={p.isSwitching} switchError={p.switchError} onSwitch={p.changeMethod} />}
      <PaymentMethodRenderer p={p} />
      <PaymentActions isWaiting={isWait} onCancel={onCancel} />
    </div>
  );
}

function StatusDispatcher({ p, onCancel, onReview }: any) {
  const b = p.booking;
  if (b.status === 'COMPLETED') return <CompletedStaySection booking={b} onOpenReview={onReview} />;
  if (b.status === 'PROCESSED') return <ConfirmedStaySection booking={b} />;
  if (b.status === 'CANCELLED' || b.status === 'REJECTED') return <CancelledStaySection booking={b} />;
  return <PaymentActiveFlow p={p} onCancel={onCancel} />;
}

function calculateStayDuration(b: any): number {
  if (b.totalNights && b.totalNights > 0) return b.totalNights;
  try {
    const diff = differenceInCalendarDays(parseISO(b.checkOutDate), parseISO(b.checkInDate));
    return diff > 0 ? diff : 1;
  } catch {
    return 1;
  }
}

function OrderPaymentGrid({ b, p, onCancel, onReview }: any) {
  const nights = calculateStayDuration(b);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7"><StatusDispatcher p={p} onCancel={onCancel} onReview={onReview} /></div>
      <div className="lg:col-span-5">
        <OrderSummaryCard propertyTitle={b.property.title} propertyCity={b.property.city} roomName={b.room.name} basePrice={b.room.basePrice} checkInDate={b.checkInDate} checkOutDate={b.checkOutDate} nights={nights} guestCount={b.guestCount} totalPrice={b.totalPrice} />
      </div>
    </div>
  );
}

function OrderPaymentLoading() {
  return (
    <div className="py-20 text-center">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
      <p className="text-sm text-gray-500">Memuat detail pesanan...</p>
    </div>
  );
}

function OrderPaymentError() {
  return (
    <div className="py-20 text-center max-w-md mx-auto space-y-4">
      <p className="text-base text-gray-700 font-medium">Pesanan tidak ditemukan atau terjadi kesalahan.</p>
      <Link to="/orders"><Button variant="primary" size="sm">Kembali ke Pesanan Saya</Button></Link>
    </div>
  );
}

function useAutoRedirectOnUpload(uploadSuccess: string | null): void {
  const navigate = useNavigate();
  useEffect(() => {
    if (!uploadSuccess) return;
    const timer = setTimeout(() => navigate('/orders'), 5000);
    return () => clearTimeout(timer);
  }, [uploadSuccess, navigate]);
}

function PaymentModals({ showCancel, setShowCancel, showReview, setShowReview, p }: any) {
  return (
    <>
      <CancelOrderModal isOpen={showCancel} onClose={() => setShowCancel(false)} onConfirm={async (r) => { await p.cancelOrder(r); setShowCancel(false); }} isCancelling={p.isCancelling} />
      <ReviewFormModal isOpen={showReview} onClose={() => { setShowReview(false); p.refetch(); }} bookingId={p.booking.id} propertyTitle={p.booking.property?.title} />
    </>
  );
}

function useOrderPaymentState(id: string) {
  const p = useOrderPayment(id);
  const [showCancel, setShowCancel] = useState(false);
  const [showReview, setShowReview] = useState(false);
  useAutoRedirectOnUpload(p.uploadSuccess);
  return { p, showCancel, setShowCancel, showReview, setShowReview };
}

export function OrderPaymentPage(): React.JSX.Element {
  const { id = '' } = useParams<{ id: string }>();
  const s = useOrderPaymentState(id);
  if (s.p.isLoading) return <OrderPaymentLoading />;
  if (s.p.isError || !s.p.booking) return <OrderPaymentError />;
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <PaymentHeader code={s.p.booking.bookingCode} status={s.p.booking.status} />
      <OrderPaymentGrid b={s.p.booking} p={s.p} onCancel={() => s.setShowCancel(true)} onReview={() => s.setShowReview(true)} />
      <PaymentModals showCancel={s.showCancel} setShowCancel={s.setShowCancel} showReview={s.showReview} setShowReview={s.setShowReview} p={s.p} />
    </div>
  );
}
