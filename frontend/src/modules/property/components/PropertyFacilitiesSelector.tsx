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
  Check,
} from 'lucide-react';

export const AVAILABLE_FACILITIES = [
  { id: 'WiFi Kecepatan Tinggi', label: 'WiFi', icon: Wifi },
  { id: 'Air Conditioning (AC)', label: 'AC', icon: AirVent },
  { id: 'Kolam Renang', label: 'Kolam Renang', icon: Waves },
  { id: 'Area Parkir Gratis', label: 'Parkir Gratis', icon: Car },
  { id: 'Resepsionis 24 Jam', label: 'Resepsionis 24 Jam', icon: Clock },
  { id: 'Dapur & Alat Makan', label: 'Dapur', icon: Utensils },
  { id: 'Smart TV & Hiburan', label: 'Smart TV', icon: Tv },
  { id: 'Keamanan 24 Jam', label: 'Keamanan 24 Jam', icon: ShieldCheck },
];

export interface PropertyFacilitiesSelectorProps {
  selected?: string[];
  onChange: (facilities: string[]) => void;
}

interface ChipProps {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

function ChipIcon({ isSelected, icon: Icon }: { isSelected: boolean; icon: React.ComponentType<{ className?: string }> }) {
  const boxCls = isSelected ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500';
  return (
    <div className={`w-5 h-5 rounded-md flex items-center justify-center ${boxCls}`}>
      {isSelected ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
    </div>
  );
}

function FacilityChip({ id, label, icon, isSelected, onToggle }: ChipProps) {
  const btnCls = isSelected
    ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm'
    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50';
  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all ${btnCls}`}
    >
      <ChipIcon isSelected={isSelected} icon={icon} />
      <span>{label}</span>
    </button>
  );
}

function getNextFacilities(selected: string[], id: string): string[] {
  return selected.includes(id)
    ? selected.filter((item) => item !== id)
    : [...selected, id];
}

interface GridProps {
  selected: string[];
  onToggle: (id: string) => void;
}

function FacilitiesChipsGrid({ selected, onToggle }: GridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {AVAILABLE_FACILITIES.map((fac) => (
        <FacilityChip
          key={fac.id} id={fac.id} label={fac.label} icon={fac.icon}
          isSelected={selected.includes(fac.id)} onToggle={onToggle}
        />
      ))}
    </div>
  );
}

export function PropertyFacilitiesSelector({
  selected = [],
  onChange,
}: PropertyFacilitiesSelectorProps): React.JSX.Element {
  const toggle = (id: string) => onChange(getNextFacilities(selected, id));
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-800 block">
        Fasilitas Properti (Pilih yang Tersedia)
      </label>
      <FacilitiesChipsGrid selected={selected} onToggle={toggle} />
    </div>
  );
}
