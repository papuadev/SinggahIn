import React from 'react';
import { ArrowRight, Calendar, Building2 } from 'lucide-react';
import { Booking } from '../../../modules/booking/booking.types';
import { getStatusBadge } from '../../../modules/booking/components/OrderHistoryCard';
import { formatRupiah, formatDateID } from '../../../libs/formatters';

interface TableProps {
  bookings: Booking[];
  onSelect: (b: Booking) => void;
}

function GuestCell({ user }: { user?: Booking['user'] }) {
  const name = user?.name || 'Tamu';
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-extrabold text-xs flex items-center justify-center shrink-0">
        {initial}
      </div>
      <div className="min-w-0">
        <p className="font-bold text-gray-900 truncate max-w-[130px]">{name}</p>
        <p className="text-gray-400 text-xs truncate max-w-[130px]">{user?.email || '-'}</p>
      </div>
    </div>
  );
}

function PropertyCell({ property, room }: { property: Booking['property']; room: Booking['room'] }) {
  return (
    <div className="min-w-0">
      <p className="font-semibold text-gray-900 truncate max-w-[160px]">{property.title}</p>
      <p className="text-gray-400 text-xs truncate max-w-[160px] mt-0.5">{room.name}</p>
    </div>
  );
}

function StatusPill({ status }: { status: Booking['status'] }) {
  const badge = getStatusBadge(status);
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border whitespace-nowrap font-medium ${badge.style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{badge.label}</span>
    </span>
  );
}

function ReviewButton({ onClick, ariaLabel }: { onClick: () => void; ariaLabel?: string }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 active:scale-95 shadow-xs hover:shadow transition-all cursor-pointer group"
    >
      <span>Tinjau</span>
      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
}

function CodeCell({ code }: { code: string }) {
  return (
    <td className="p-4 font-mono font-bold text-gray-800 whitespace-nowrap">
      <span className="bg-gray-100/80 border border-gray-200/50 px-2 py-1 rounded-lg text-xs">{code}</span>
    </td>
  );
}

function TableRow({ b, onSelect }: { b: Booking; onSelect: (b: Booking) => void }): React.JSX.Element {
  const dates = `${formatDateID(b.checkInDate, 'dd MMM')} - ${formatDateID(b.checkOutDate, 'dd MMM yyyy')}`;
  return (
    <tr className="border-b border-gray-50 last:border-b-0 hover:bg-primary-50/30 transition-colors text-xs sm:text-sm">
      <CodeCell code={b.bookingCode} />
      <td className="p-4"><GuestCell user={b.user} /></td>
      <td className="p-4"><PropertyCell property={b.property} room={b.room} /></td>
      <td className="p-4 text-xs text-gray-600 whitespace-nowrap">{dates}</td>
      <td className="p-4 font-extrabold text-gray-950 whitespace-nowrap">{formatRupiah(b.totalPrice)}</td>
      <td className="p-4 whitespace-nowrap text-center"><StatusPill status={b.status} /></td>
      <td className="p-4 text-right whitespace-nowrap"><ReviewButton onClick={() => onSelect(b)} /></td>
    </tr>
  );
}

function MobileCardBody({ b, dates }: { b: Booking; dates: string }) {
  return (
    <div>
      <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5"><Building2 className="w-4 h-4 text-primary-600" /> {b.property.title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{b.room.name} · {b.user?.name || 'Tamu'}</p>
      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {dates}</p>
    </div>
  );
}

function MobileCardFooter({ totalPrice, onSelect }: { totalPrice: number; onSelect: () => void }) {
  return (
    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
      <div>
        <span className="text-[10px] text-gray-400 block uppercase">Total Biaya</span>
        <span className="font-bold text-gray-900 text-sm">{formatRupiah(totalPrice)}</span>
      </div>
      <ReviewButton onClick={onSelect} ariaLabel="Detail Pesanan" />
    </div>
  );
}

function MobileOrderCard({ b, onSelect }: { b: Booking; onSelect: (b: Booking) => void }) {
  const dates = `${formatDateID(b.checkInDate, 'dd MMM')} - ${formatDateID(b.checkOutDate, 'dd MMM yyyy')}`;
  return (
    <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{b.bookingCode}</span>
        <StatusPill status={b.status} />
      </div>
      <MobileCardBody b={b} dates={dates} />
      <MobileCardFooter totalPrice={b.totalPrice} onSelect={() => onSelect(b)} />
    </div>
  );
}

function DesktopThead() {
  return (
    <thead className="bg-gray-50/70 text-gray-400 font-bold uppercase tracking-wider text-[11px] border-b border-gray-100">
      <tr>
        <th className="p-4 whitespace-nowrap text-center">Kode</th>
        <th className="p-4 text-center">Tamu</th>
        <th className="p-4 text-center">Properti</th>
        <th className="p-4 whitespace-nowrap text-center">Jadwal In-Out</th>
        <th className="p-4 whitespace-nowrap text-center">Total</th>
        <th className="p-4 whitespace-nowrap text-center">Status</th>
        <th className="p-4 text-center whitespace-nowrap w-16">Aksi</th>
      </tr>
    </thead>
  );
}

function DesktopTable({ bookings, onSelect }: TableProps) {
  return (
    <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-xs">
      <table className="w-full text-left text-xs text-gray-600">
        <DesktopThead />
        <tbody>{bookings.map((b) => <TableRow key={b.id} b={b} onSelect={onSelect} />)}</tbody>
      </table>
    </div>
  );
}

export function TenantOrderTable({ bookings, onSelect }: TableProps): React.JSX.Element {
  return (
    <>
      <DesktopTable bookings={bookings} onSelect={onSelect} />
      <div className="md:hidden space-y-3">
        {bookings.map((b) => <MobileOrderCard key={b.id} b={b} onSelect={onSelect} />)}
      </div>
    </>
  );
}
