import React from 'react';
import { Calendar, Info } from 'lucide-react';
import { InteractivePriceCalendar } from '../../../components/organisms/property-detail/InteractivePriceCalendar';

export interface TenantRoomStatusCalendarProps {
  propertyId: string;
  rooms?: Array<{ id: string; name: string; basePrice: number }>;
}

function CalendarInfoBanner(): React.JSX.Element {
  return (
    <div className="flex items-start gap-3 p-4 bg-primary-50/70 border border-primary-100 rounded-xl mb-6 text-xs text-primary-900">
      <Info className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
      <div>
        <h4 className="font-bold mb-0.5">Pemantauan Alokasi Kamar (Allotment Monitor)</h4>
        <p className="text-primary-800 leading-relaxed">
          Gunakan kalender ini untuk merekonsiliasi ketersediaan unit fisik, memantau tanggal yang diblokir pemeliharaan, serta memastikan tarif efektif harian telah sesuai.
        </p>
      </div>
    </div>
  );
}

function EmptyRoomsMessage(): React.JSX.Element {
  return (
    <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
      <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-2" />
      <h4 className="text-sm font-bold text-gray-800 mb-1">Belum Ada Tipe Kamar</h4>
      <p className="text-xs text-gray-500 max-w-sm mx-auto">
        Tambahkan minimal satu tipe kamar di tab "Tipe &amp; Tarif Kamar" agar kalender status kamar dapat ditampilkan.
      </p>
    </div>
  );
}

export function TenantRoomStatusCalendar({ propertyId, rooms = [] }: TenantRoomStatusCalendarProps): React.JSX.Element {
  if (rooms.length === 0) {
    return <EmptyRoomsMessage />;
  }

  return (
    <div className="space-y-4">
      <CalendarInfoBanner />
      <InteractivePriceCalendar propertyId={propertyId} rooms={rooms} />
    </div>
  );
}
