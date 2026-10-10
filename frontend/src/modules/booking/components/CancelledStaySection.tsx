import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, Search } from 'lucide-react';
import { Booking } from '../booking.types';
import { formatRupiah } from '../../../libs/formatters';
import { Button } from '../../../components/atoms/Button';

function CancelledBanner({ isRejected, reason }: { isRejected: boolean; reason?: string | null }) {
  const title = isRejected ? 'Pesanan Ditolak oleh Pengelola' : 'Pesanan Telah Dibatalkan';
  const desc = reason || (isRejected ? 'Pengelola menolak pesanan Anda.' : 'Pesanan ini telah dibatalkan.');
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-3.5">
      <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <h4 className="font-bold text-rose-900 text-base">{title}</h4>
        <p className="text-xs text-rose-800 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function CancelledPaymentInfo({ price }: { price: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex justify-between items-center text-xs">
      <div>
        <span className="text-gray-400 block">Total Biaya Pemesanan</span>
        <span className="font-bold text-gray-700 text-base">{formatRupiah(price)}</span>
      </div>
      <span className="bg-rose-100 text-rose-800 font-semibold px-3 py-1 rounded-full border border-rose-200">
        Tidak Aktif
      </span>
    </div>
  );
}

export function CancelledStaySection({ booking }: { booking: Booking }): React.JSX.Element {
  const isRejected = booking.status === 'REJECTED';
  return (
    <div className="space-y-5">
      <CancelledBanner isRejected={isRejected} reason={booking.cancellationReason} />
      <CancelledPaymentInfo price={booking.totalPrice} />
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <Link to="/orders" className="w-full sm:w-auto">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} className="w-full">
            Kembali ke Riwayat Pesanan
          </Button>
        </Link>
        <Link to="/search" className="w-full sm:w-auto">
          <Button variant="primary" size="sm" leftIcon={<Search className="w-4 h-4" />} className="w-full">
            Cari Penginapan Lain
          </Button>
        </Link>
      </div>
    </div>
  );
}
