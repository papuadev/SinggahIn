import React from 'react';
import { CreditCard, ShieldCheck, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '../../../components/atoms/Button';

export interface MidtransPaymentSectionProps {
  isPayingSnap: boolean;
  snapError: string | null;
  onPay: () => void;
  isPaid?: boolean;
  pendingPayment?: any;
  isResetting?: boolean;
  onReset?: () => void;
}

const CHANNELS = ['QRIS', 'GoPay', 'BCA / BNI / BRI VA', 'Kartu Kredit / Debit'];

function GatewayBadges(): React.JSX.Element {
  return (
    <div className="space-y-2 pt-1">
      <p className="text-xs text-gray-500 font-medium">Metode pembayaran yang didukung:</p>
      <div className="flex flex-wrap gap-2">
        {CHANNELS.map((name) => (
          <span
            key={name}
            className="text-xs bg-gray-100 text-gray-600 font-medium px-3 py-1.5 rounded-lg border border-gray-200 select-none cursor-default"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

function PendingVaBox({ pending }: { pending: any }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(pending.vaNumber || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
      <p className="text-xs text-amber-800 font-semibold uppercase">Menunggu Pembayaran Virtual Account ({pending.bank || 'VA'})</p>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500">Nomor Virtual Account:</p>
          <p className="font-mono text-base font-bold text-gray-900">{pending.vaNumber}</p>
        </div>
        <Button size="sm" variant="outline" onClick={handleCopy}>{copied ? 'Tersalin!' : 'Salin'}</Button>
      </div>
    </div>
  );
}

function PendingQrBox({ pending }: { pending: any }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center space-y-2">
      <p className="text-xs font-semibold text-gray-700">QRIS Pembayaran</p>
      <img src={pending.qrUrl} alt="QR Code Pembayaran" className="w-48 h-48 mx-auto border bg-white p-2 rounded-lg object-contain" />
      <p className="text-xs text-gray-400">Pindai kode QR di atas untuk menyelesaikan pembayaran</p>
    </div>
  );
}

function PendingPaymentCard({ pending }: { pending: any }) {
  if (pending.vaNumber) return <PendingVaBox pending={pending} />;
  if (pending.qrUrl) return <PendingQrBox pending={pending} />;
  return null;
}

function PaidNotice(): React.JSX.Element {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        <div>
          <p className="font-bold">Pembayaran Berhasil Diverifikasi!</p>
          <p className="text-xs text-emerald-700 mt-0.5">Pembayaran telah berhasil diverifikasi secara otomatis.</p>
        </div>
      </div>
    </div>
  );
}

function GatewayHeader() {
  return (
    <div>
      <div className="flex items-center gap-2 text-primary-700">
        <CreditCard className="w-5 h-5" />
        <h3 className="font-bold text-gray-900 text-lg">Metode Pembayaran Otomatis</h3>
      </div>
      <p className="text-xs text-gray-500 mt-1">Pilih metode pembayaran instan dan aman (QRIS, GoPay, Virtual Account, Kartu Kredit).</p>
    </div>
  );
}

function SnapErrorAlert({ error }: { error: string }) {
  return (
    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2.5">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <div>
        <p className="font-bold">Gagal Memulai Pembayaran Otomatis</p>
        <p className="mt-0.5 text-rose-600 font-medium">{error}</p>
      </div>
    </div>
  );
}

function GatewayActionButtons({ pending, isPaying, isResetting, onPay, onReset }: any) {
  if (!pending) {
    return (
      <Button variant="primary" className="w-full" leftIcon={<ShieldCheck className="w-4 h-4 shrink-0" />} isLoading={isPaying} onClick={onPay}>
        Bayar Sekarang
      </Button>
    );
  }
  return (
    <div className="space-y-2 pt-1">
      <Button variant="primary" className="w-full" leftIcon={<ShieldCheck className="w-4 h-4 shrink-0" />} isLoading={isPaying} onClick={onPay}>
        Buka Rincian Pembayaran
      </Button>
      <Button variant="outline" size="sm" className="w-full text-xs" leftIcon={<RotateCcw className="w-3.5 h-3.5 shrink-0" />} isLoading={isResetting} onClick={onReset}>
        Pilih Ulang Metode Pembayaran Otomatis
      </Button>
    </div>
  );
}


export function MidtransPaymentSection(props: MidtransPaymentSectionProps): React.JSX.Element {
  if (props.isPaid) return <PaidNotice />;
  return (
    <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
      <GatewayHeader />
      {props.pendingPayment ? <PendingPaymentCard pending={props.pendingPayment} /> : <GatewayBadges />}
      {props.snapError && <SnapErrorAlert error={props.snapError} />}
      <GatewayActionButtons
        pending={props.pendingPayment} isPaying={props.isPayingSnap}
        isResetting={props.isResetting} onPay={props.onPay} onReset={props.onReset}
      />
    </div>
  );
}
