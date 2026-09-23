import React from 'react';
import {
  Wifi,
  AirVent,
  Waves,
  Car,
  Clock,
  Utensils,
  Tv,
  ShieldCheck,
} from 'lucide-react';

interface FacilityItem {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  category: string;
}

const DEFAULT_FACILITIES: FacilityItem[] = [
  { icon: Wifi, name: 'WiFi Kecepatan Tinggi', category: 'Konektivitas' },
  { icon: AirVent, name: 'Air Conditioning (AC)', category: 'Kenyamanan' },
  { icon: Waves, name: 'Kolam Renang', category: 'Fasilitas Utama' },
  { icon: Car, name: 'Area Parkir Gratis', category: 'Fasilitas Umum' },
  { icon: Clock, name: 'Resepsionis 24 Jam', category: 'Layanan' },
  { icon: Utensils, name: 'Dapur & Alat Makan', category: 'Fasilitas' },
  { icon: Tv, name: 'Smart TV & Hiburan', category: 'Kenyamanan' },
  { icon: ShieldCheck, name: 'Keamanan 24 Jam', category: 'Keamanan' },
];

function FacilityCard({ facility }: { facility: FacilityItem }) {
  const Icon = facility.icon;
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100 hover:border-primary-100 hover:bg-primary-50/30 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-primary-100/60 flex items-center justify-center text-primary-700 flex-shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-tight">{facility.name}</p>
        <span className="text-[11px] text-gray-500">{facility.category}</span>
      </div>
    </div>
  );
}

function FacilitiesHeader() {
  return (
    <div className="mb-4">
      <h2 id="fasilitas-properti" className="text-lg sm:text-xl font-bold text-gray-900">
        Fasilitas Properti
      </h2>
      <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
        Fasilitas unggulan yang disediakan untuk kenyamanan selama menginap
      </p>
    </div>
  );
}

export function PropertyDetailFacilities(): React.JSX.Element {
  return (
    <section aria-labelledby="fasilitas-properti" className="py-6 border-b border-gray-100">
      <FacilitiesHeader />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {DEFAULT_FACILITIES.map((fac) => (
          <FacilityCard key={fac.name} facility={fac} />
        ))}
      </div>
    </section>
  );
}
