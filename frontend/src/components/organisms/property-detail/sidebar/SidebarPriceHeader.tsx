import { ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { formatRupiah } from '../../../../libs/formatters';

const PERKS = [
  { icon: ShieldCheck, text: 'Pasti Dapat Kamar Terjamin' },
  { icon: Sparkles, text: 'Bebas Biaya Pemesanan Tersembunyi' },
  { icon: Zap, text: 'Konfirmasi Instan Tanpa Menunggu' },
];

export function PerksList() {
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

type PriceHeaderProps = { price?: number; roomName?: string; nights?: number };

export function SidebarPriceHeader({ price, roomName, nights = 0 }: PriceHeaderProps) {
  const priceText = price ? formatRupiah(price) : 'Hubungi Kami';
  const label = nights > 1 ? 'Tarif rata-rata' : nights === 1 ? 'Tarif per malam' : 'Mulai dari';
  return (
    <div className="flex items-baseline justify-between pb-3 border-b border-gray-100">
      <div>
        <span className="text-xs text-gray-500 font-medium block">{label}</span>
        <div className="text-xl sm:text-2xl font-black text-primary-600">
          {priceText}{price && <span className="text-xs font-normal text-gray-500 ml-1">/ malam</span>}
        </div>
      </div>
      <RoomBadge roomName={roomName} />
    </div>
  );
}
