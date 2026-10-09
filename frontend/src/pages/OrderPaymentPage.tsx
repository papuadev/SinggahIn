import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrderPayment } from '../modules/booking/hooks/useOrderPayment';
import { CountdownTimerBadge } from '../modules/booking/components/CountdownTimerBadge';
import { OrderSummaryCard } from '../modules/booking/components/OrderSummaryCard';
import { ManualTransferSection } from '../modules/payment/components/ManualTransferSection';
import { MidtransPaymentSection } from '../modules/payment/components/MidtransPaymentSection';
import { CancelOrderModal } from '../modules/booking/components/CancelOrderModal';
import { getStatusBadge } from '../modules/booking/components/OrderHistoryCard';
import { Button } from '../components/atoms/Button';

function PaymentHeader({ code, status }: { code: string; status: any }) {
  const badge = getStatusBadge(status);
  return (
    <div className="flex flex-wrap justify-between items-center gap-2 pb-2">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pembayaran Pesanan</h1>
        <p className="font-mono text-sm text-gray-500">Kode: {code}</p>
      </div>
      <span className={`text-sm px-3 py-1 rounded-full font-medium border ${badge.style}`}>{badge.label}</span>
    </div>
  );
}

function PaymentMethodRenderer({ p }: { p: ReturnType<typeof useOrderPayment> }) {
  const b = p.booking!;
  const isManual = b.payment?.paymentMethod === 'MANUAL_TRANSFER';
  const proofUrl = b.payment?.proofImageUrl || b.payment?.paymentProofUrl;
  if (isManual) {
    return (
      <ManualTransferSection
        isUploading={p.isUploading} uploadError={p.uploadError}
        uploadSuccess={p.uploadSuccess} onUpload={p.uploadProof}
        existingProofUrl={proofUrl}
      />
    );
  }
  return <MidtransPaymentSection isPayingSnap={p.isPayingSnap} snapError={p.snapError} onPay={p.payWithSnap} isPaid={b.status === 'PROCESSED'} />;
}

function PaymentLeftCol({ p, onCancel }: { p: ReturnType<typeof useOrderPayment>; onCancel: () => void }) {
  const b = p.booking!;
  return (
    <div className="lg:col-span-7 space-y-6">
      {b.status === 'WAITING_PAYMENT' && <CountdownTimerBadge timer={p.timer} />}
      <PaymentMethodRenderer p={p} />
      {b.status === 'WAITING_PAYMENT' && (
        <div className="flex justify-between items-center pt-2">
          <Link to="/orders"><Button variant="ghost" size="sm">Kembali ke Pesanan Saya</Button></Link>
          <Button variant="danger" size="sm" onClick={onCancel}>Batalkan Pesanan</Button>
        </div>
      )}
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

function OrderPaymentGrid({ b, p, onCancel }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <PaymentLeftCol p={p} onCancel={onCancel} />
      <div className="lg:col-span-5">
        <OrderSummaryCard propertyTitle={b.property.title} propertyCity={b.property.city} roomName={b.room.name} basePrice={b.room.basePrice} checkInDate={b.checkInDate} checkOutDate={b.checkOutDate} nights={1} guestCount={b.guestCount} totalPrice={b.totalPrice} />
      </div>
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

export function OrderPaymentPage(): React.JSX.Element {
  const { id = '' } = useParams<{ id: string }>();
  const p = useOrderPayment(id);
  const [showCancel, setShowCancel] = useState(false);
  if (p.isLoading) return <OrderPaymentLoading />;
  if (p.isError || !p.booking) return <OrderPaymentError />;
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <PaymentHeader code={p.booking.bookingCode} status={p.booking.status} />
      <OrderPaymentGrid b={p.booking} p={p} onCancel={() => setShowCancel(true)} />
      <CancelOrderModal isOpen={showCancel} onClose={() => setShowCancel(false)} onConfirm={async (r) => { await p.cancelOrder(r); setShowCancel(false); }} isCancelling={p.isCancelling} />
    </div>
  );
}
