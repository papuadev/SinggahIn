import React from 'react';
import { CreditCard, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/atoms/Button';

export interface MidtransPaymentSectionProps {
  isPayingSnap: boolean;
  snapError: string | null;
  onPay: () => void;
  isPaid?: boolean;
}

function GatewayBadges(): React.JSX.Element {
  return (
    <div className="flex flex-wrap gap-2 pt-2">
      <span className="text-xs bg-gray-100 text-gray-700 font-semibold px-2.5 py-1 rounded-md border border-gray-200">QRIS</span>
      <span className="text-xs bg-gray-100 text-gray-700 font-semibold px-2.5 py-1 rounded-md border border-gray-200">GoPay</span>
      <span className="text-xs bg-gray-100 text-gray-700 font-semibold px-2.5 py-1 rounded-md border border-gray-200">BCA / BNI / BRI VA</span>
      <span className="text-xs bg-gray-100 text-gray-700 font-semibold px-2.5 py-1 rounded-md border border-gray-200">Kartu Kredit/Debit</span>
    </div>
  );
}

function PaidNotice(): React.JSX.Element {
  return (
    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm">
      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
      <span>Pembayaran telah berhasil diverifikasi oleh Midtrans!</span>
    </div>
  );
}

function MidtransHeader() {
  return (
    <>
      <div className="flex items-center gap-2 text-primary-700">
        <CreditCard className="w-5 h-5" />
        <h3 className="font-bold text-gray-900 text-lg">Pembayaran Otomatis (Midtrans)</h3>
      </div>
      <p className="text-xs text-gray-500">Pilih beragam metode pembayaran instan dan aman melalui gateway Midtrans.</p>
    </>
  );
}

export function MidtransPaymentSection(props: MidtransPaymentSectionProps): React.JSX.Element {
  if (props.isPaid) return <PaidNotice />;
  return (
    <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
      <MidtransHeader />
      <GatewayBadges />
      {props.snapError && <p className="text-xs text-rose-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {props.snapError}</p>}
      <Button variant="primary" className="w-full flex items-center justify-center gap-2" isLoading={props.isPayingSnap} onClick={props.onPay}>
        <ShieldCheck className="w-4 h-4" /> Bayar Sekarang via Midtrans
      </Button>
    </div>
  );
}
