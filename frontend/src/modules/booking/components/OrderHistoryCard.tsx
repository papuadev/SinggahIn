import React from 'react';
import { Building2, Calendar, CreditCard, ChevronRight } from 'lucide-react';
import { Booking, BookingStatus } from '../booking.types';
import { formatRupiah, formatDateID } from '../../../libs/formatters';
import { Button } from '../../../components/atoms/Button';

export interface OrderHistoryCardProps {
  booking: Booking;
  onPay?: (id: string) => void;
  onCancel?: (id: string) => void;
  onViewDetail: (id: string) => void;
}

export function getStatusBadge(status: BookingStatus): { label: string; style: string } {
  switch (status) {
    case 'WAITING_PAYMENT': return { label: 'Menunggu Pembayaran', style: 'bg-amber-100 text-amber-800 border-amber-200' };
    case 'WAITING_CONFIRMATION': return { label: 'Menunggu Konfirmasi', style: 'bg-sky-100 text-sky-800 border-sky-200' };
    case 'PROCESSED': return { label: 'Pesanan Dikonfirmasi', style: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'COMPLETED': return { label: 'Selesai Menginap', style: 'bg-primary-100 text-primary-800 border-primary-200' };
    case 'CANCELLED': return { label: 'Dibatalkan', style: 'bg-rose-100 text-rose-800 border-rose-200' };
    case 'REJECTED': return { label: 'Ditolak', style: 'bg-rose-100 text-rose-800 border-rose-200' };
    default: return { label: status, style: 'bg-gray-100 text-gray-800 border-gray-200' };
  }
}

function CardHeader({ code, status }: { code: string; status: BookingStatus }) {
  const badge = getStatusBadge(status);
  return (
    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
      <span className="font-mono text-xs font-bold text-gray-500">{code}</span>
      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${badge.style}`}>{badge.label}</span>
    </div>
  );
}

function CardBody({ b }: { b: Booking }) {
  return (
    <div className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div>
        <h4 className="font-bold text-gray-900 text-base flex items-center gap-1.5"><Building2 className="w-4 h-4 text-primary-600" /> {b.property.title}</h4>
        <p className="text-xs text-gray-500">{b.room.name} • {b.guestCount} tamu</p>
        <p className="text-xs text-gray-600 mt-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDateID(b.checkInDate, 'dd MMM')} - {formatDateID(b.checkOutDate, 'dd MMM yyyy')}</p>
      </div>
      <div className="text-left md:text-right">
        <span className="text-xs text-gray-400 block">Total Biaya</span>
        <span className="font-bold text-primary-600 text-base">{formatRupiah(b.totalPrice)}</span>
      </div>
    </div>
  );
}

function CardActions({ b, onPay, onCancel, onView }: any) {
  return (
    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
      {b.status === 'WAITING_PAYMENT' && onCancel && (
        <Button variant="ghost" size="sm" onClick={() => onCancel(b.id)}>Batalkan</Button>
      )}
      {b.status === 'WAITING_PAYMENT' && onPay ? (
        <Button variant="primary" size="sm" leftIcon={<CreditCard className="w-3.5 h-3.5" />} onClick={() => onPay(b.id)}>Bayar Sekarang</Button>
      ) : (
        <Button variant="primary" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />} onClick={() => onView(b.id)}>Lihat Pesanan</Button>
      )}
    </div>
  );
}

export function OrderHistoryCard({ booking, onPay, onCancel, onViewDetail }: OrderHistoryCardProps): React.JSX.Element {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:border-gray-300 transition-colors">
      <CardHeader code={booking.bookingCode} status={booking.status} />
      <CardBody b={booking} />
      <CardActions b={booking} onPay={onPay} onCancel={onCancel} onView={onViewDetail} />
    </div>
  );
}
