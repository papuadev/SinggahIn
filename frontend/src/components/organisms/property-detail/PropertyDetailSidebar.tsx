import React from 'react';
import { ShieldCheck, Zap, Sparkles, ArrowDown } from 'lucide-react';
import { Button } from '../../atoms/Button';
import { formatRupiah } from '../../../libs/formatters';

export interface PropertyDetailSidebarProps {
  lowestPrice?: number;
  onScrollToRooms: () => void;
}

const PERKS = [
  { icon: ShieldCheck, text: 'Pasti Dapat Kamar Terjamin' },
  { icon: Sparkles, text: 'Bebas Biaya Pemesanan Tersembunyi' },
  { icon: Zap, text: 'Konfirmasi Instan Tanpa Menunggu' },
];

function PerksList() {
  return (
    <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5">
      {PERKS.map((perk) => {
        const Icon = perk.icon;
        return (
          <div key={perk.text} className="flex items-center gap-2.5 text-xs text-gray-600">
            <Icon className="w-4 h-4 text-primary-600 flex-shrink-0" />
            <span>{perk.text}</span>
          </div>
        );
      })}
    </div>
  );
}

function SidebarPriceHeader({ lowestPrice }: { lowestPrice?: number }) {
  return (
    <div className="flex flex-col gap-1 pb-4 border-b border-gray-100">
      <span className="text-xs text-gray-500 font-medium">Harga terbaik mulai dari</span>
      <div className="text-2xl font-black text-primary-600">
        {lowestPrice ? formatRupiah(lowestPrice) : 'Hubungi Kami'}
        {lowestPrice && <span className="text-xs font-normal text-gray-500 ml-1">/ malam</span>}
      </div>
    </div>
  );
}

function SidebarCtaBtn({ onClick }: { onClick: () => void }) {
  return (
    <div className="my-5">
      <Button type="button" variant="primary" size="lg" onClick={onClick} rightIcon={<ArrowDown className="w-4 h-4" />} className="w-full font-bold shadow-md shadow-primary-500/20">
        Lihat Pilihan Kamar
      </Button>
    </div>
  );
}

export function PropertyDetailSidebar({
  lowestPrice,
  onScrollToRooms,
}: PropertyDetailSidebarProps): React.JSX.Element {
  return (
    <aside className="hidden lg:block sticky top-24 h-fit p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <SidebarPriceHeader lowestPrice={lowestPrice} />
      <SidebarCtaBtn onClick={onScrollToRooms} />
      <PerksList />
    </aside>
  );
}
