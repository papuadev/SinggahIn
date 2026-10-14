import React, { useState, useMemo } from 'react';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { Select } from '../../atoms/Select';
import { formatRupiah } from '../../../libs/formatters';
import { useStayPricing } from '../../../modules/room/hooks/useRoomPricing';
import { useAuthStore } from '../../../stores/auth.store';
import { DateTriggerBox, CalendarPopover } from './sidebar/CalendarPopover';
import { SidebarPriceHeader, PerksList } from './sidebar/SidebarPriceHeader';
import { SidebarBookingCta } from './sidebar/SidebarBookingCta';

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
  isCalendarOpen?: boolean;
  onCalendarOpenChange?: (open: boolean) => void;
}

function RoomOptions({ rooms }: { rooms: any[] }) {
  return <>{rooms.map((r) => <option key={r.id} value={r.id}>{r.name} ({formatRupiah(r.basePrice)}/malam)</option>)}</>;
}

type RoomSelectProps = { rooms: any[]; activeId?: string; onChange?: (id: string) => void; };

function RoomSelectField({ rooms, activeId, onChange }: RoomSelectProps) {
  return (
    <Select
      id="sidebar-room-select"
      value={activeId || rooms[0]?.id}
      onChange={(e) => onChange?.(e.target.value)}
      aria-label="Pilih Tipe Kamar"
      className="bg-gray-50/70 font-semibold rounded-xl text-xs sm:text-sm text-gray-800 border-gray-200"
    >
      <RoomOptions rooms={rooms} />
    </Select>
  );
}

function SidebarRoomSelector(p: RoomSelectProps) {
  if (p.rooms.length <= 1) return null;
  return (
    <div className="mt-2.5">
      <label htmlFor="sidebar-room-select" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
        Tipe Kamar
      </label>
      <RoomSelectField {...p} />
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

function SidebarStayBreakdown({ nights, total }: { nights: number; total: number }) {
  if (nights <= 0 || !total) return null;
  return (
    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm">
      <span className="text-gray-600 font-medium">Total ({nights} Malam)</span>
      <span className="font-extrabold text-primary-700 text-base">{formatRupiah(total)}</span>
    </div>
  );
}

function useSidebarBooking(props: PropertyDetailSidebarProps) {
  const { rooms = [], selectedRoomId, lowestPrice, checkIn, checkOut, onBookRoom, isCalendarOpen, onCalendarOpenChange } = props;
  const { isAuthenticated } = useAuthStore();
  const [internalOpen, setInternalOpen] = useState(false);
  const isCalOpen = isCalendarOpen ?? internalOpen;
  const setIsCalOpen = onCalendarOpenChange || setInternalOpen;
  const activeRoom = useMemo(() => rooms.find((r) => r.id === selectedRoomId) || rooms[0], [rooms, selectedRoomId]);
  const nights = calculateStayNights(checkIn, checkOut);
  const { data: pricing } = useStayPricing(activeRoom?.id, checkIn, checkOut);
  const activePrice = pricing?.averageNightRate || activeRoom?.basePrice || lowestPrice || 0;
  const totalPrice = pricing?.totalStayPrice || (nights * (activeRoom?.basePrice || 0));
  const handleCta = () => { if (!isAuthenticated) return; if (nights <= 0) setIsCalOpen(true); onBookRoom?.(activeRoom?.id || ''); };
  return { isCalOpen, setIsCalOpen, activeRoom, activePrice, totalPrice, nights, handleCta, isAuthenticated };
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
    <div id="bagian-pemilihan-tanggal" className="relative mt-3 z-30">
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
      <SidebarPriceHeader price={s.activePrice} roomName={s.activeRoom?.name} nights={s.nights} />
      <SidebarDateSection propertyId={propertyId} rooms={rooms} activeRoomId={s.activeRoom?.id} onRoomChange={onRoomChange} checkIn={checkIn} checkOut={checkOut} onSelectDates={onSelectDates} isOpen={s.isCalOpen} onToggle={() => s.setIsCalOpen(!s.isCalOpen)} onClose={() => s.setIsCalOpen(false)} />
      <SidebarRoomSelector rooms={rooms} activeId={s.activeRoom?.id} onChange={onRoomChange} />
      <SidebarStayBreakdown nights={s.nights} total={s.totalPrice} />
      <SidebarBookingCta onClick={s.handleCta} hasDates={s.nights > 0} isAuthenticated={s.isAuthenticated} />
      <PerksList />
    </aside>
  );
}
