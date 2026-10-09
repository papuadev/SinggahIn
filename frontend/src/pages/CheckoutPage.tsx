import React from 'react';
import { ShieldCheck, UserCheck } from 'lucide-react';
import { useCheckout } from '../modules/booking/hooks/useCheckout';
import { OrderSummaryCard } from '../modules/booking/components/OrderSummaryCard';
import { PaymentMethod } from '../modules/booking/booking.types';
import { Button } from '../components/atoms/Button';
import { Alert } from '../components/atoms/Alert';
import { formatRupiah } from '../libs/formatters';

function GuestContactCard({ user }: { user: any }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-3">
      <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><UserCheck className="w-5 h-5 text-primary-600" /> Data Pemesan</h3>
      <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1 text-gray-700">
        <p><span className="font-semibold">Nama:</span> {user?.name || 'Tamu'}</p>
        <p><span className="font-semibold">Email:</span> {user?.email}</p>
        <p><span className="font-semibold">No. HP:</span> {user?.phoneNumber || '-'}</p>
      </div>
    </div>
  );
}

function MethodOption({ id, label, desc, active, onSelect }: any) {
  const cls = active ? 'border-primary-600 bg-primary-50/40 text-primary-900 ring-2 ring-primary-500' : 'border-gray-200 hover:border-gray-300';
  return (
    <div onClick={() => onSelect(id)} className={`p-4 rounded-xl border cursor-pointer transition-all ${cls}`}>
      <p className="font-bold text-sm">{label}</p>
      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
    </div>
  );
}

function PaymentSelector({ current, onSelect }: { current: PaymentMethod; onSelect: (m: PaymentMethod) => void }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
      <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary-600" /> Metode Pembayaran</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MethodOption id="MANUAL_TRANSFER" label="Transfer Bank Manual" desc="Upload bukti transfer (Batas waktu 2 jam)" active={current === 'MANUAL_TRANSFER'} onSelect={onSelect} />
        <MethodOption id="PAYMENT_GATEWAY" label="Payment Gateway (Midtrans)" desc="QRIS, GoPay, Virtual Account otomatis" active={current === 'PAYMENT_GATEWAY'} onSelect={onSelect} />
      </div>
    </div>
  );
}

function CheckoutLoading() {
  return <div className="py-20 text-center"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" /><p className="text-sm text-gray-500">Memuat detail pesanan...</p></div>;
}

function CheckoutAlerts({ hasDates, errorMsg }: { hasDates: boolean; errorMsg: string | null }) {
  return (
    <>
      {!hasDates && (
        <Alert variant="warning">
          Tanggal menginap belum dipilih. Silakan kembali ke detail properti untuk memilih tanggal sebelum checkout.
        </Alert>
      )}
      {errorMsg && <p className="text-sm text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200">{errorMsg}</p>}
    </>
  );
}

function CheckoutLeftCol({ c }: { c: ReturnType<typeof useCheckout> }) {
  return (
    <div className="lg:col-span-7 space-y-6">
      <GuestContactCard user={c.user} />
      <PaymentSelector current={c.paymentMethod} onSelect={c.setPaymentMethod} />
      <CheckoutAlerts hasDates={c.hasDates} errorMsg={c.errorMsg} />
      <Button variant="primary" size="lg" className="w-full text-base" isLoading={c.isSubmitting} disabled={!c.hasDates} onClick={c.handleBooking}>
        Konfirmasi Pesanan • {formatRupiah(c.estimatedTotal)}
      </Button>
    </div>
  );
}

export function CheckoutPage(): React.JSX.Element {
  const c = useCheckout();
  if (c.isLoading || !c.property || !c.room) return <CheckoutLoading />;
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Checkout & Konfirmasi Pemesanan</h1>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <CheckoutLeftCol c={c} />
        <div className="lg:col-span-5">
          <OrderSummaryCard propertyTitle={c.property.title} propertyCity={c.property.city} roomName={c.room.name} basePrice={c.room.basePrice} checkInDate={c.checkInDate} checkOutDate={c.checkOutDate} nights={c.nights} guestCount={c.guestCount} totalPrice={c.estimatedTotal} />
        </div>
      </div>
    </div>
  );
}
