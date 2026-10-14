import React from 'react';
import { Building2, Calendar, CreditCard, ChevronRight, Star } from 'lucide-react';
import { Booking, BookingStatus } from '../booking.types';
import { formatRupiah, formatDateID } from '../../../libs/formatters';
import { Button } from '../../../components/atoms/Button';

export interface OrderHistoryCardProps {
  booking: Booking;
  onPay?: (id: string) => void;
  onCancel?: (id: string) => void;
  onViewDetail: (id: string) => void;
  onReview?: (booking: Booking) => void;
}

export function getStatusBadge(status: BookingStatus): { label: string; style: string } {
  switch (status) {
    case 'WAITING_PAYMENT': return { label: 'Menunggu Pembayaran', style: 'bg-amber-50 text-amber-800 border-amber-200' };
    case 'WAITING_CONFIRMATION': return { label: 'Menunggu Konfirmasi', style: 'bg-sky-50 text-sky-800 border-sky-200' };
    case 'PROCESSED': return { label: 'Pesanan Dikonfirmasi', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    case 'COMPLETED': return { label: 'Selesai Menginap', style: 'bg-primary-50 text-primary-800 border-primary-200' };
    case 'CANCELLED': return { label: 'Dibatalkan', style: 'bg-rose-50 text-rose-800 border-rose-200' };
    case 'REJECTED': return { label: 'Ditolak', style: 'bg-rose-50 text-rose-800 border-rose-200' };
    default: return { label: status, style: 'bg-gray-50 text-gray-800 border-gray-200' };
  }
}

function CardHeader({ code, status }: { code: string; status: BookingStatus }) {
  const badge = getStatusBadge(status);
  return (
    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
      <span className="font-mono text-xs font-bold text-gray-800 bg-gray-50 border border-gray-200/60 px-2.5 py-1 rounded-lg">
        {code}
      </span>
      <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold border ${badge.style}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
        <span>{badge.label}</span>
      </span>
    </div>
  );
}

function CardPropertyVisual() {
  return (
    <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
      <Building2 className="w-5 h-5" />
    </div>
  );
}

function CardPropertyDetails({ b }: { b: Booking }) {
  const dates = `${formatDateID(b.checkInDate, 'dd MMM')} - ${formatDateID(b.checkOutDate, 'dd MMM yyyy')}`;
  return (
    <div className="min-w-0">
      <h4 className="font-bold text-gray-900 text-base truncate">{b.property.title}</h4>
      <p className="text-xs text-gray-500 mt-0.5">{b.room.name} · {b.guestCount} tamu</p>
      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-primary-600 shrink-0" />
        <span>{dates}</span>
      </p>
    </div>
  );
}

function CardBody({ b }: { b: Booking }) {
  return (
    <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5 min-w-0">
        <CardPropertyVisual />
        <CardPropertyDetails b={b} />
      </div>
      <div className="text-left md:text-right shrink-0">
        <span className="text-[11px] font-semibold text-gray-400 block uppercase tracking-wider">Total Biaya</span>
        <span className="font-extrabold text-gray-950 text-lg">{formatRupiah(b.totalPrice)}</span>
      </div>
    </div>
  );
}

function ReviewedBadge({ rating }: { rating: number }) {
  return (
    <span className="text-xs font-semibold text-amber-700 flex items-center gap-1 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-200">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Sudah Diulas ({rating}★)
    </span>
  );
}

function CardReviewAction({ b, onReview }: { b: Booking; onReview?: (b: Booking) => void }) {
  if (b.status !== 'COMPLETED') return null;
  if (b.review) return <ReviewedBadge rating={b.review.rating} />;
  if (!onReview) return null;
  return (
    <Button variant="outline" size="sm" className="rounded-xl text-amber-700 border-amber-300 hover:bg-amber-50"
      leftIcon={<Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />} onClick={() => onReview(b)}>
      Beri Ulasan
    </Button>
  );
}

function CardActions({ b, onPay, onCancel, onView, onReview }: any) {
  return (
    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
      {b.status === 'WAITING_PAYMENT' && onCancel && (
        <Button variant="ghost" size="sm" className="rounded-xl text-xs" onClick={() => onCancel(b.id)}>Batalkan</Button>
      )}
      <CardReviewAction b={b} onReview={onReview} />
      {b.status === 'WAITING_PAYMENT' && onPay ? (
        <Button variant="primary" size="sm" className="rounded-xl text-xs font-semibold" leftIcon={<CreditCard className="w-3.5 h-3.5" />} onClick={() => onPay(b.id)}>Bayar Sekarang</Button>
      ) : (
        <Button variant="primary" size="sm" className="rounded-xl text-xs font-semibold" rightIcon={<ChevronRight className="w-3.5 h-3.5" />} onClick={() => onView(b.id)}>Lihat Pesanan</Button>
      )}
    </div>
  );
}

export function OrderHistoryCard({ booking, onPay, onCancel, onViewDetail, onReview }: OrderHistoryCardProps): React.JSX.Element {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-xs hover:shadow-sm hover:border-gray-200 transition-all">
      <CardHeader code={booking.bookingCode} status={booking.status} />
      <CardBody b={booking} />
      <CardActions b={booking} onPay={onPay} onCancel={onCancel} onView={onViewDetail} onReview={onReview} />
    </div>
  );
}
