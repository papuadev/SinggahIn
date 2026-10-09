import React from 'react';
import { Calendar, Users, MapPin, Building2 } from 'lucide-react';
import { formatRupiah, formatDateID } from '../../../libs/formatters';

export interface OrderSummaryProps {
  propertyTitle: string;
  propertyCity: string;
  roomName: string;
  basePrice: number;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guestCount: number;
  totalPrice: number;
}

function ScheduleItem({ label, date }: { label: string; date: string }): React.JSX.Element {
  return (
    <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
      <span className="text-xs text-gray-500 font-medium block">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{formatDateID(date, 'dd MMM yyyy')}</span>
    </div>
  );
}

function StayScheduleInfo({ inDate, outDate, nights, guests }: { inDate: string; outDate: string; nights: number; guests: number }) {
  return (
    <div className="space-y-3 py-3 border-y border-gray-100">
      <div className="flex gap-2">
        <ScheduleItem label="Check-in" date={inDate} />
        <ScheduleItem label="Check-out" date={outDate} />
      </div>
      <div className="flex items-center justify-between text-xs text-gray-600 px-1">
        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {nights} malam</span>
        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {guests} tamu</span>
      </div>
    </div>
  );
}

function PriceRow({ label, amount, isTotal = false }: { label: string; amount: number; isTotal?: boolean }) {
  const cls = isTotal ? 'text-base font-bold text-gray-900 pt-2 border-t border-gray-100' : 'text-sm text-gray-600';
  return (
    <div className={`flex justify-between items-center ${cls}`}>
      <span>{label}</span>
      <span className={isTotal ? 'text-primary-600 font-bold text-lg' : 'font-medium'}>{formatRupiah(amount)}</span>
    </div>
  );
}

function PropertyDetailsHeader({ title, city, roomName }: { title: string; city: string; roomName: string }) {
  return (
    <div>
      <h4 className="font-bold text-gray-800 flex items-center gap-1.5"><Building2 className="w-4 h-4 text-primary-600" /> {title}</h4>
      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {city}</p>
      <p className="text-sm font-medium text-primary-700 mt-2 bg-primary-50 px-2.5 py-1 rounded-md inline-block">{roomName}</p>
    </div>
  );
}

export function OrderSummaryCard(props: OrderSummaryProps): React.JSX.Element {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
      <h3 className="font-bold text-gray-900 text-lg">Ringkasan Pesanan</h3>
      <PropertyDetailsHeader title={props.propertyTitle} city={props.propertyCity} roomName={props.roomName} />
      <StayScheduleInfo inDate={props.checkInDate} outDate={props.checkOutDate} nights={props.nights} guests={props.guestCount} />
      <div className="space-y-2 pt-1">
        <PriceRow label={`${formatRupiah(props.basePrice)} × ${props.nights} malam`} amount={props.basePrice * props.nights} />
        <PriceRow label="Total Pembayaran" amount={props.totalPrice} isTotal />
      </div>
    </div>
  );
}
