import React from 'react';
import { Link } from 'react-router-dom';
import { Booking } from '../../../modules/booking/booking.types';
import { formatDateID } from '../../../libs/formatters';

function BookingDateBlock({ checkIn }: { checkIn: string }) {
  const dayNumber = formatDateID(checkIn, 'dd');
  const monthAbbr = formatDateID(checkIn, 'LLL').toUpperCase();
  return (
    <div className="w-12 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center shrink-0">
      <span className="text-sm font-extrabold text-gray-900 leading-tight">{dayNumber}</span>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{monthAbbr}</span>
    </div>
  );
}

function BookingGuestInfo({ booking }: { booking: Booking }) {
  const guestName = booking.user?.name || booking.user?.email || 'Tamu';
  const nights = booking.totalNights || 2;
  const guests = booking.guestCount || 2;
  return (
    <div className="truncate">
      <p className="text-sm font-bold text-gray-900 truncate">{guestName}</p>
      <p className="text-xs text-gray-400 mt-0.5">{nights} malam · {guests} tamu</p>
    </div>
  );
}

function BookingItemRow({ booking }: { booking: Booking }): React.JSX.Element {
  const dotColor = booking.status === 'WAITING_CONFIRMATION' ? 'bg-amber-400' : 'bg-emerald-500';
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex items-center gap-3.5 min-w-0">
        <BookingDateBlock checkIn={booking.checkInDate} />
        <BookingGuestInfo booking={booking} />
      </div>
      <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0`} />
    </div>
  );
}

function SectionHeader() {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base sm:text-lg font-bold text-gray-800">Reservasi mendatang</h3>
      <Link to="/tenant/orders?status=PROCESSED&sortBy=checkIn_asc" className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
        Lihat semua
      </Link>
    </div>
  );
}

function UpcomingBookingsList({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return <p className="text-center py-10 text-xs sm:text-sm text-gray-400">Belum ada reservasi mendatang.</p>;
  }
  return (
    <div className="space-y-2 divide-y divide-gray-50">
      {bookings.map((b) => <BookingItemRow key={b.id} booking={b} />)}
    </div>
  );
}

export function DashboardUpcomingBookings({ bookings }: { bookings: Booking[] }): React.JSX.Element {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between h-full">
      <SectionHeader />
      <UpcomingBookingsList bookings={bookings.slice(0, 3)} />
    </div>
  );
}
