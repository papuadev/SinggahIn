import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';

function AlertText({ count }: { count: number }) {
  return (
    <div>
      <p className="text-sm font-bold text-amber-900">
        {count} Pesanan Menunggu Konfirmasi Bukti Transfer
      </p>
      <p className="text-xs text-amber-700">
        Segera verifikasi bukti pembayaran tamu agar reservasi dapat diproses.
      </p>
    </div>
  );
}

function AlertButton() {
  return (
    <Link to="/tenant/orders?status=WAITING_CONFIRMATION" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-200/80 hover:bg-amber-300 rounded-lg transition-colors shrink-0">
      <span>Periksa Pesanan</span>
      <ArrowRight className="w-3.5 h-3.5" />
    </Link>
  );
}

export function DashboardPendingActionAlert({ pendingCount }: { pendingCount: number }): React.JSX.Element | null {
  if (pendingCount <= 0) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6 shadow-xs">
      <div className="flex items-center gap-3">
        <span className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0">
          <AlertCircle className="w-5 h-5" />
        </span>
        <AlertText count={pendingCount} />
      </div>
      <AlertButton />
    </div>
  );
}
