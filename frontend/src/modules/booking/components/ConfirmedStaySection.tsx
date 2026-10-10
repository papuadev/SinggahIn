import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Ticket, MapPin, Calendar } from 'lucide-react';
import { Booking } from '../booking.types';
import { formatDateID, formatRupiah } from '../../../libs/formatters';
import { Button } from '../../../components/atoms/Button';

function ConfirmedBanner({ code }: { code: string }) {
  return (
    <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3.5">
      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <h4 className="font-bold text-emerald-900 text-base">Pembayaran Berhasil Diverifikasi!</h4>
        <p className="text-xs text-emerald-800 leading-relaxed">
          Pesanan akomodasi Anda telah dikonfirmasi. Tunjukkan kode booking <strong className="font-mono">{code}</strong> saat proses check-in di resepsionis.
        </p>
      </div>
    </div>
  );
}

function CheckInDates({ checkIn, checkOut }: { checkIn: string; checkOut: string }) {
  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center gap-2 text-gray-700">
        <Calendar className="w-4 h-4 text-primary-600 shrink-0" />
        <span>Check-in: <strong>{formatDateID(checkIn, 'dd MMMM yyyy')}</strong> (Mulai 14:00 WIB)</span>
      </div>
      <div className="flex items-center gap-2 text-gray-700">
        <Calendar className="w-4 h-4 text-primary-600 shrink-0" />
        <span>Check-out: <strong>{formatDateID(checkOut, 'dd MMMM yyyy')}</strong> (Maksimal 12:00 WIB)</span>
      </div>
    </div>
  );
}

function CheckInInstructionCard({ booking }: { booking: Booking }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-primary-700">
        <Ticket className="w-4 h-4" />
        <h5 className="font-bold text-gray-900 text-sm">Petunjuk Menginap</h5>
      </div>
      <CheckInDates checkIn={booking.checkInDate} checkOut={booking.checkOutDate} />
      <div className="flex items-start gap-2 text-gray-700 pt-2 border-t border-gray-100 text-xs">
        <MapPin className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
        <span>Lokasi: {booking.property.address}, {booking.property.city}</span>
      </div>
    </div>
  );
}

function ConfirmedPaymentCard({ booking }: { booking: Booking }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex justify-between items-center text-xs">
      <div>
        <span className="text-gray-400 block">Total Pembayaran Lunas</span>
        <span className="font-bold text-primary-700 text-base">{formatRupiah(booking.totalPrice)}</span>
      </div>
      <span className="bg-emerald-100 text-emerald-800 font-semibold px-3 py-1 rounded-full border border-emerald-200">
        Terverifikasi
      </span>
    </div>
  );
}

export function ConfirmedStaySection({ booking }: { booking: Booking }): React.JSX.Element {
  return (
    <div className="space-y-5">
      <ConfirmedBanner code={booking.bookingCode} />
      <CheckInInstructionCard booking={booking} />
      <ConfirmedPaymentCard booking={booking} />
      <div className="pt-2">
        <Link to="/orders">
          <Button variant="primary" size="md" className="w-full">
            Lihat Pesanan
          </Button>
        </Link>
      </div>
    </div>
  );
}
