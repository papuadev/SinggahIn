import React from 'react';
import { MapPin, Building, ChevronRight, LucideIcon } from 'lucide-react';
import { GeocodeSuggestion, CatalogPropertyItem } from '../../../modules/property/property.types';
import { optimizeImageUrl } from '../../../libs/image';

export function cleanDisplayCity(city?: string, formatted?: string): string {
  const raw = (city || (formatted ? formatted.split(',')[0] : '')).trim();
  const cleaned = raw.replace(/^(daerah khusus ibukota|kota administrasi|kota|kabupaten|kab\.)\s+/i, '').trim();
  return cleaned || raw;
}

function SuggestionSectionHeader({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <li className="px-3 pt-2.5 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 select-none" aria-hidden="true">
      <div className="p-1 rounded-md bg-gray-100 text-gray-500"><Icon className="w-3 h-3 text-primary-600" /></div>
      <span>{title}</span>
    </li>
  );
}

function PropertySuggestionItem({ prop, onSelect }: { prop: CatalogPropertyItem; onSelect: (p: CatalogPropertyItem) => void }) {
  const priceStr = prop.pricing?.averageNightRate ? `Rp ${prop.pricing.averageNightRate.toLocaleString('id-ID')}` : null;
  return (
    <li>
      <button type="button" onClick={() => onSelect(prop)} className="w-full text-left p-2.5 rounded-xl hover:bg-primary-50/60 text-xs sm:text-sm text-gray-800 flex items-center justify-between gap-3 transition-all duration-150 group cursor-pointer">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {prop.coverImage ? (
            <img src={optimizeImageUrl(prop.coverImage, 80, 80)} alt={prop.title} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-100 shadow-2xs" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/70 text-primary-600 flex items-center justify-center shrink-0 border border-primary-200/40">
              <Building className="w-4 h-4" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">{prop.title}</span>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 truncate">
              <span className="text-[10px] font-semibold text-primary-700 bg-primary-50 px-1.5 py-0.2 rounded border border-primary-200/50 uppercase tracking-wide shrink-0">{prop.category.name}</span>
              <span className="truncate">{prop.city}</span>
              {priceStr && <span className="text-gray-400 shrink-0">• {priceStr} / malam</span>}
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all shrink-0" />
      </button>
    </li>
  );
}

function CitySuggestionItem({ sug, onSelect }: { sug: GeocodeSuggestion; onSelect: (s: GeocodeSuggestion) => void }) {
  const title = cleanDisplayCity(sug.city, sug.formattedAddress);
  return (
    <li>
      <button type="button" onClick={() => onSelect(sug)} className="w-full text-left p-2.5 rounded-xl hover:bg-primary-50/60 text-xs sm:text-sm text-gray-800 flex items-center justify-between gap-3 transition-all duration-150 group cursor-pointer">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-primary-50 text-gray-500 group-hover:text-primary-600 flex items-center justify-center shrink-0 transition-colors border border-gray-200/50 group-hover:border-primary-200/50">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">{title}</span>
            <span className="text-xs text-gray-400 truncate line-clamp-1 mt-0.5">{sug.formattedAddress}</span>
          </div>
        </div>
        <span className="text-[11px] font-medium text-gray-400 group-hover:text-primary-600 shrink-0 hidden sm:inline-block">Pilih Kota</span>
      </button>
    </li>
  );
}

export type DropdownProps = {
  cities: GeocodeSuggestion[]; properties: CatalogPropertyItem[];
  onSelectCity: (s: GeocodeSuggestion) => void; onSelectProp: (p: CatalogPropertyItem) => void;
};

export function SuggestionsDropdown(p: DropdownProps): React.JSX.Element | null {
  if (p.cities.length === 0 && p.properties.length === 0) return null;
  return (
    <ul className="absolute z-50 left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden max-h-80 overflow-y-auto p-1.5 space-y-1">
      {p.properties.length > 0 && (
        <div className="space-y-0.5">
          <SuggestionSectionHeader icon={Building} title="Penginapan & Destinasi" />
          {p.properties.map((prop) => (
            <PropertySuggestionItem key={prop.id} prop={prop} onSelect={p.onSelectProp} />
          ))}
        </div>
      )}
      {p.cities.length > 0 && (
        <div className="space-y-0.5 pt-1">
          <SuggestionSectionHeader icon={MapPin} title="Kota & Lokasi" />
          {p.cities.map((sug, i) => (
            <CitySuggestionItem key={i} sug={sug} onSelect={p.onSelectCity} />
          ))}
        </div>
      )}
    </ul>
  );
}
