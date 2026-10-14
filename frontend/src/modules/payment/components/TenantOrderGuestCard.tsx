import { Phone, Calendar, CreditCard, AlertCircle } from 'lucide-react';
import { Booking } from '../../booking/booking.types';
import { formatRupiah, formatDateID, formatPaymentMethodLabel } from '../../../libs/formatters';
import { getStatusBadge } from '../../booking/components/OrderHistoryCard';

function GuestAvatar({ user }: { user?: Booking['user'] }) {
  const name = user?.name || 'Tamu';
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 font-extrabold text-xs flex items-center justify-center shrink-0">
        {initial}
      </div>
      <div className="min-w-0">
        <p className="font-bold text-gray-900 text-sm truncate">{name}</p>
        <p className="text-gray-400 text-xs truncate">{user?.email || '-'}</p>
      </div>
    </div>
  );
}

function GuestStatusPill({ status }: { status: Booking['status'] }) {
  const badge = getStatusBadge(status);
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap font-medium shrink-0 ${badge.style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{badge.label}</span>
    </span>
  );
}

function GuestAvatarAndInfo({ b }: { b: Booking }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <GuestAvatar user={b.user} />
      <GuestStatusPill status={b.status} />
    </div>
  );
}

function GuestMetaRow({ phone, checkIn, checkOut }: { phone?: string | null; checkIn: string; checkOut: string }) {
  const dates = `${formatDateID(checkIn, 'dd MMM yyyy')} - ${formatDateID(checkOut, 'dd MMM yyyy')}`;
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-gray-500"><Phone className="w-3.5 h-3.5 text-gray-400" />{phone || '-'}</span>
      <span className="flex items-center gap-1.5 text-gray-500"><Calendar className="w-3.5 h-3.5 text-gray-400" />{dates}</span>
    </div>
  );
}

function GuestPriceRow({ price, method }: { price: number; method?: string }) {
  return (
    <div className="flex items-center justify-between pt-0.5">
      <span className="font-extrabold text-primary-700 text-sm">{formatRupiah(price)}</span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[10px] font-semibold text-gray-700">
        <CreditCard className="w-3 h-3 text-gray-400" />{formatPaymentMethodLabel(method)}
      </span>
    </div>
  );
}

function GuestScheduleAndPrice({ b }: { b: Booking }) {
  return (
    <div className="space-y-2 text-xs text-gray-600 border-t border-slate-200/70 pt-2.5">
      <GuestMetaRow phone={b.user?.phoneNumber} checkIn={b.checkInDate} checkOut={b.checkOutDate} />
      <GuestPriceRow price={b.totalPrice} method={b.payment?.paymentMethod} />
    </div>
  );
}

function RejectionBanner({ reason }: { reason?: string | null }) {
  if (!reason) return null;
  return (
    <div className="flex items-start gap-2 bg-rose-50 border border-rose-200/80 rounded-xl p-2.5 text-xs text-rose-800">
      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
      <div>
        <span className="font-bold">Alasan Penolakan: </span>
        <span>{reason}</span>
      </div>
    </div>
  );
}

export function GuestInfoRow({ b }: { b: Booking }) {
  return (
    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5 shadow-xs">
      <GuestAvatarAndInfo b={b} />
      <GuestScheduleAndPrice b={b} />
      {b.status === 'REJECTED' && <RejectionBanner reason={b.cancellationReason} />}
    </div>
  );
}
