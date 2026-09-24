import React, { useState, useMemo } from 'react';
import { ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { Button } from '../../atoms/Button';
import { formatRupiah } from '../../../libs/formatters';
import { DateTriggerBox, CalendarPopover } from './sidebar/CalendarPopover';

export interface PropertyDetailSidebarProps {
  propertyId: string;
  rooms?: Array<{ id: string; name: string; basePrice: number }>;
  selectedRoomId?: string;
  onRoomChange?: (roomId: string) => void;
  checkIn?: string;
  checkOut?: string;
  lowestPrice?: number;
  onSelectDates?: (checkIn: string, checkOut: string) => void;
  onBookRoom?: (roomId: string) => void;
}

const PERKS = [
  { icon: ShieldCheck, text: 'Pasti Dapat Kamar Terjamin' },
  { icon: Sparkles, text: 'Bebas Biaya Pemesanan Tersembunyi' },
  { icon: Zap, text: 'Konfirmasi Instan Tanpa Menunggu' },
];

function PerksList() {
  return (
    <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col gap-2">
      {PERKS.map((perk) => {
        const Icon = perk.icon;
        return (
          <div key={perk.text} className="flex items-center gap-2 text-xs text-gray-600">
            <Icon className="w-3.5 h-3.5 text-primary-600 shrink-0" />
            <span>{perk.text}</span>
          </div>
        );
      })}
    </div>
  );
}

function RoomBadge({ roomName }: { roomName?: string }) {
  if (!roomName) return null;
  return (
    <span className="text-xs font-semibold px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full border border-primary-100 max-w-[140px] truncate">
      {roomName}
    </span>
  );
}

function SidebarPriceHeader({ price, roomName }: { price?: number; roomName?: string }) {
  const priceText = price ? formatRupiah(price) : 'Hubungi Kami';
  return (
    <div className="flex items-baseline justify-between pb-3 border-b border-gray-100">
      <div>
        <span className="text-xs text-gray-500 font-medium block">Mulai dari</span>
        <div className="text-xl sm:text-2xl font-black text-primary-600">
          {priceText}
          {price && <span className="text-xs font-normal text-gray-500 ml-1">/ malam</span>}
        </div>
      </div>
      <RoomBadge roomName={roomName} />
    </div>
  );
}

function RoomOptions({ rooms }: { rooms: any[] }) {
  return (
    <>
      {rooms.map((r) => <option key={r.id} value={r.id}>{r.name} ({formatRupiah(r.basePrice)}/malam)</option>)}
    </>
  );
}

function SidebarRoomSelector({ rooms, activeId, onChange }: { rooms: any[]; activeId?: string; onChange?: (id: string) => void }) {
  if (rooms.length <= 1) return null;
  return (
    <div className="mt-2.5">
      <label htmlFor="sidebar-room-select" className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
        Tipe Kamar
      </label>
      <select id="sidebar-room-select" value={activeId || rooms[0]?.id} onChange={(e) => onChange?.(e.target.value)} aria-label="Pilih Tipe Kamar" className="w-full text-xs sm:text-sm font-semibold text-gray-800 bg-gray-50/70 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500">
        <RoomOptions rooms={rooms} />
      </select>
    </div>
  );
}

function calculateStayNights(inDate?: string, outDate?: string): number {
  if (!inDate || !outDate) return 0;
  try {
    const diff = differenceInCalendarDays(parseISO(outDate), parseISO(inDate));
    return diff > 0 ? diff : 0;
  } catch {
    return 0;
  }
}

function SidebarStayBreakdown({ nights, price }: { nights: number; price: number }) {
  if (nights <= 0 || !price) return null;
  const total = nights * price;
  return (
    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm">
      <span className="text-gray-600 font-medium">Total ({nights} Malam)</span>
      <span className="font-extrabold text-primary-700 text-base">{formatRupiah(total)}</span>
    </div>
  );
}

function useSidebarBooking(props: PropertyDetailSidebarProps) {
  const { rooms = [], selectedRoomId, lowestPrice, checkIn, checkOut, onBookRoom } = props;
  const [isCalOpen, setIsCalOpen] = useState(false);
  const activeRoom = useMemo(() => rooms.find((r) => r.id === selectedRoomId) || rooms[0], [rooms, selectedRoomId]);
  const activePrice = activeRoom?.basePrice || lowestPrice || 0;
  const nights = calculateStayNights(checkIn, checkOut);
  const handleCta = () => {
    if (nights <= 0) { setIsCalOpen(true); return; }
    onBookRoom?.(activeRoom?.id || '');
  };
  return { isCalOpen, setIsCalOpen, activeRoom, activePrice, nights, handleCta };
}

function SidebarBookingCta({ onClick, hasDates }: { onClick: () => void; hasDates: boolean }) {
  return (
    <div className="mt-4">
      <Button type="button" variant="primary" size="lg" onClick={onClick} className="w-full font-bold shadow-md shadow-primary-500/20">
        {hasDates ? 'Pesan Sekarang' : 'Pilih Tanggal Menginap'}
      </Button>
    </div>
  );
}

interface DateSectionProps {
  propertyId: string;
  rooms?: Array<{ id: string; name: string; basePrice: number }>;
  activeRoomId?: string;
  onRoomChange?: (roomId: string) => void;
  checkIn?: string;
  checkOut?: string;
  onSelectDates?: (checkIn: string, checkOut: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

function SidebarDateSection(p: DateSectionProps) {
  return (
    <div className="relative mt-3">
      <DateTriggerBox checkIn={p.checkIn} checkOut={p.checkOut} onClick={p.onToggle} isOpen={p.isOpen} />
      <CalendarPopover isOpen={p.isOpen} onClose={p.onClose} propertyId={p.propertyId} rooms={p.rooms} activeRoomId={p.activeRoomId} onRoom={p.onRoomChange} inDate={p.checkIn} outDate={p.checkOut} onDates={p.onSelectDates} />
    </div>
  );
}

export function PropertyDetailSidebar(props: PropertyDetailSidebarProps): React.JSX.Element {
  const { propertyId, rooms = [], onRoomChange, checkIn, checkOut, onSelectDates } = props;
  const s = useSidebarBooking(props);
  return (
    <aside aria-label="Widget Pemesanan Properti" className="relative w-full bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm static lg:sticky lg:top-24 h-fit">
      <SidebarPriceHeader price={s.activePrice} roomName={s.activeRoom?.name} />
      <SidebarDateSection propertyId={propertyId} rooms={rooms} activeRoomId={s.activeRoom?.id} onRoomChange={onRoomChange} checkIn={checkIn} checkOut={checkOut} onSelectDates={onSelectDates} isOpen={s.isCalOpen} onToggle={() => s.setIsCalOpen(!s.isCalOpen)} onClose={() => s.setIsCalOpen(false)} />
      <SidebarRoomSelector rooms={rooms} activeId={s.activeRoom?.id} onChange={onRoomChange} />
      <SidebarStayBreakdown nights={s.nights} price={s.activePrice} />
      <SidebarBookingCta onClick={s.handleCta} hasDates={s.nights > 0} />
      <PerksList />
    </aside>
  );
}
