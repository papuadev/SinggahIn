import { Building2, MapPin, Users, BedDouble } from 'lucide-react';
import { Booking } from '../../booking/booking.types';

function PropertyThumbnail({ src, title }: { src?: string; title: string }) {
  if (!src) {
    return (
      <div className="w-20 h-20 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0 text-primary-600">
        <Building2 className="w-8 h-8" />
      </div>
    );
  }
  return <img src={src} alt={title} className="w-20 h-20 rounded-2xl object-cover border border-gray-200 shrink-0 shadow-xs" />;
}

function PropertyLocationAndRoom({ address, city, roomName, guests }: { address: string; city: string; roomName: string; guests: number }) {
  const loc = city ? `${city} • ${address}` : address;
  return (
    <div className="space-y-1 text-xs text-gray-500 mt-1">
      <p className="flex items-center gap-1.5 truncate"><MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" /><span className="truncate">{loc}</span></p>
      <div className="flex items-center gap-3 text-[11px] pt-0.5">
        <span className="flex items-center gap-1 text-gray-600 font-medium"><BedDouble className="w-3 h-3 text-primary-600" />{roomName}</span>
        <span className="flex items-center gap-1 text-gray-600"><Users className="w-3 h-3 text-gray-400" />{guests} Tamu</span>
      </div>
    </div>
  );
}

export function TenantOrderPropertyCard({ b }: { b: Booking }) {
  const thumbUrl = b.property.images?.[0]?.imageUrl || (b.room as any)?.images?.[0]?.imageUrl;
  return (
    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 flex items-start gap-3 shadow-xs">
      <PropertyThumbnail src={thumbUrl} title={b.property.title} />
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary-700 bg-primary-100/70 px-2 py-0.5 rounded-md">Properti</span>
        <h4 className="font-bold text-gray-900 text-sm truncate mt-0.5">{b.property.title}</h4>
        <PropertyLocationAndRoom address={b.property.address} city={b.property.city} roomName={b.room.name} guests={b.guestCount} />
      </div>
    </div>
  );
}
