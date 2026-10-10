import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Star, CreditCard, ArrowRight, ArrowLeft } from 'lucide-react';
import { Booking } from '../booking.types';
import { formatDateID, formatRupiah } from '../../../libs/formatters';
import { Button } from '../../../components/atoms/Button';
import { StarRatingDisplay } from '../../review/components/StarRating';

export interface CompletedStaySectionProps {
  booking: Booking;
  onOpenReview?: () => void;
}

function StaySummaryCard({ checkOutDate, propertyTitle }: { checkOutDate: string; propertyTitle: string }) {
  return (
    <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3.5">
      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <h4 className="font-bold text-emerald-900 text-base">Masa Menginap Telah Selesai</h4>
        <p className="text-xs text-emerald-800 leading-relaxed">
          Reservasi Anda di <strong>{propertyTitle}</strong> telah selesai pada {formatDateID(checkOutDate, 'dd MMMM yyyy')}. Terima kasih telah menginap bersama SinggahIn!
        </p>
      </div>
    </div>
  );
}

function PaymentDetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function PaymentDetailCard({ booking }: { booking: Booking }) {
  const isGateway = booking.payment?.paymentMethod === 'PAYMENT_GATEWAY';
  const methodLabel = isGateway ? 'Pembayaran Otomatis (Midtrans)' : 'Transfer Bank Manual';
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-primary-700">
        <CreditCard className="w-4 h-4" />
        <h5 className="font-bold text-gray-900 text-sm">Informasi Pembayaran</h5>
      </div>
      <div>
        <PaymentDetailRow label="Status Pembayaran" value={<span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Lunas / Terverifikasi</span>} />
        <PaymentDetailRow label="Metode" value={methodLabel} />
        <PaymentDetailRow label="Total Biaya" value={<span className="text-primary-700 font-bold">{formatRupiah(booking.totalPrice)}</span>} />
      </div>
    </div>
  );
}

function ReviewedCard({ review }: { review: NonNullable<Booking['review']> }) {
  return (
    <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> Ulasan Anda
        </span>
        <StarRatingDisplay rating={review.rating} size="sm" />
      </div>
      <p className="text-xs sm:text-sm text-gray-700 italic bg-amber-50/50 p-3 rounded-xl border border-amber-100">
        "{review.comment}"
      </p>
      <span className="text-[11px] text-emerald-700 font-medium block">✓ Ulasan Anda telah dipublikasikan di halaman properti.</span>
    </div>
  );
}

function UnreviewedPromptCard({ onOpenReview }: { onOpenReview?: () => void }) {
  return (
    <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <h5 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> Bagikan Pengalaman Menginap Anda
        </h5>
        <p className="text-xs text-gray-600">Bantu calon tamu lain dengan memberikan rating & ulasan jujur tentang fasilitas dan kenyamanan kamar.</p>
      </div>
      <Button variant="primary" size="sm" onClick={onOpenReview} className="shrink-0 bg-amber-500 hover:bg-amber-600 border-none text-white font-semibold">
        Beri Ulasan Sekarang
      </Button>
    </div>
  );
}

function CompletedStayActions({ propertyId }: { propertyId: string }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
      <Link to="/orders" className="w-full sm:w-auto">
        <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} className="w-full">Kembali ke Riwayat Pesanan</Button>
      </Link>
      <Link to={`/properties/${propertyId}`} className="w-full sm:w-auto">
        <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />} className="w-full">Pesan Lagi di Properti Ini</Button>
      </Link>
    </div>
  );
}

export function CompletedStaySection({ booking, onOpenReview }: CompletedStaySectionProps): React.JSX.Element {
  return (
    <div className="space-y-5">
      <StaySummaryCard checkOutDate={booking.checkOutDate} propertyTitle={booking.property.title} />
      <PaymentDetailCard booking={booking} />
      {booking.review ? <ReviewedCard review={booking.review} /> : <UnreviewedPromptCard onOpenReview={onOpenReview} />}
      <CompletedStayActions propertyId={booking.propertyId || booking.property.id} />
    </div>
  );
}
